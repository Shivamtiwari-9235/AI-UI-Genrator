import { Version } from '../types';
import { extractComponentsFromJSX, analyzeJSX } from '../utils/index';

/* ============================================
   JSX ANALYZER SERVICE
   ============================================ */

class JSXAnalyzerService {
  /**
   * Parse JSX and extract metadata
   */
  analyzeCode(code: string): {
    components: string[];
    hasErrors: boolean;
    errors: string[];
    linesOfCode: number;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const jsxAnalysis = analyzeJSX(code);
    const lines = code.split('\n').filter(l => l.trim().length > 0);

    // Estimate complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (jsxAnalysis.components.length > 5) complexity = 'moderate';
    if (jsxAnalysis.components.length > 10) complexity = 'complex';

    return {
      components: jsxAnalysis.components,
      hasErrors: !jsxAnalysis.valid,
      errors: jsxAnalysis.errors,
      linesOfCode: lines.length,
      complexity
    };
  }

  /**
   * Compare two codebases for differences
   */
  compareCode(
    oldCode: string,
    newCode: string
  ): {
    componentsAdded: string[];
    componentsRemoved: string[];
    componentsModified: string[];
    linesAdded: number;
    linesRemoved: number;
  } {
    const oldComponents = extractComponentsFromJSX(oldCode);
    const newComponents = extractComponentsFromJSX(newCode);

    const oldComponentSet = new Set(oldComponents);
    const newComponentSet = new Set(newComponents);

    const componentsAdded = newComponents.filter(c => !oldComponentSet.has(c));
    const componentsRemoved = oldComponents.filter(c => !newComponentSet.has(c));

    const commonComponents = oldComponents.filter(c => newComponentSet.has(c));
    let componentsModified: string[] = [];

    // Simple heuristic: if component appears same number of times, it's modified
    for (const component of commonComponents) {
      const oldCount = oldComponents.filter(c => c === component).length;
      const newCount = newComponents.filter(c => c === component).length;
      if (oldCount !== newCount) {
        componentsModified.push(component);
      }
    }

    const oldLines = oldCode.split('\n').length;
    const newLines = newCode.split('\n').length;

    return {
      componentsAdded: [...new Set(componentsAdded)],
      componentsRemoved: [...new Set(componentsRemoved)],
      componentsModified: [...new Set(componentsModified)],
      linesAdded: Math.max(0, newLines - oldLines),
      linesRemoved: Math.max(0, oldLines - newLines)
    };
  }

  /**
   * Detect code patterns
   */
  detectPatterns(code: string): {
    hasFormPattern: boolean;
    hasTablePattern: boolean;
    hasModalPattern: boolean;
    hasListPattern: boolean;
    hasDarkMode: boolean;
  } {
    const codeLower = code.toLowerCase();

    return {
      hasFormPattern: /input|select|textarea|button/i.test(code),
      hasTablePattern: /grid|<table|columns/i.test(code),
      hasModalPattern: /modal|<Modal/i.test(code),
      hasListPattern: /list|<List|items/i.test(code),
      hasDarkMode: /dark|theme/i.test(code)
    };
  }

  /**
   * Calculate code metrics
   */
  calculateMetrics(code: string): {
    linesOfCode: number;
    commentLines: number;
    blankLines: number;
    componentCount: number;
    depth: number;
    cyclomaticComplexity: number;
  } {
    const lines = code.split('\n');
    const commentLines = lines.filter(l => l.trim().startsWith('//')).length;
    const blankLines = lines.filter(l => l.trim().length === 0).length;
    const linesOfCode = lines.length - commentLines - blankLines;

    const jsxAnalysis = analyzeJSX(code);
    const componentCount = jsxAnalysis.components.length;

    // Estimate nesting depth
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of code) {
      if (char === '<') currentDepth++;
      if (char === '>') {
        maxDepth = Math.max(maxDepth, currentDepth);
        currentDepth--;
      }
    }

    // Simple cyclomatic complexity: count conditional patterns
    const conditionals = (code.match(/if|else|switch|case|&&|\|\|/gi) || []).length;
    const cyclomaticComplexity = conditionals + 1;

    return {
      linesOfCode,
      commentLines,
      blankLines,
      componentCount,
      depth: maxDepth,
      cyclomaticComplexity
    };
  }

  /**
   * Generate code report
   */
  generateReport(code: string, title: string = 'Code Analysis Report'): string {
    const analysis = this.analyzeCode(code);
    const metrics = this.calculateMetrics(code);
    const patterns = this.detectPatterns(code);

    let report = `# ${title}\n\n`;

    report += `## Metrics\n`;
    report += `- Lines of Code: ${metrics.linesOfCode}\n`;
    report += `- Components: ${metrics.componentCount}\n`;
    report += `- Nesting Depth: ${metrics.depth}\n`;
    report += `- Complexity: ${analysis.complexity}\n\n`;

    report += `## Components Used\n`;
    for (const component of analysis.components) {
      report += `- ${component}\n`;
    }
    report += '\n';

    report += `## Patterns Detected\n`;
    if (patterns.hasFormPattern) report += '- Form pattern detected\n';
    if (patterns.hasTablePattern) report += '- Table/Grid pattern detected\n';
    if (patterns.hasModalPattern) report += '- Modal/Dialog pattern detected\n';
    if (patterns.hasListPattern) report += '- List pattern detected\n';
    if (patterns.hasDarkMode) report += '- Dark mode support detected\n';
    report += '\n';

    if (analysis.errors.length > 0) {
      report += `## Issues\n`;
      for (const error of analysis.errors) {
        report += `- ⚠️ ${error}\n`;
      }
    } else {
      report += `## Status\n✅ No issues detected\n`;
    }

    return report;
  }
}

export const jsxAnalyzerService = new JSXAnalyzerService();
