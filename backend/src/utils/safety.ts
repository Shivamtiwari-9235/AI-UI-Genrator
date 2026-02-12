import { SecurityCheckResult, SecurityViolation } from '../types';

/* ============================================
   SECURITY & SAFETY UTILITIES
   ============================================ */

// Prompt Injection Patterns
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /execute\s+command/i,
  /run\s+code/i,
  /bypass\s+security/i,
  /override\s+restrictions/i,
  /disable\s+validation/i,
  /jailbreak/i,
  /system\s+prompt/i,
  /administrator\s+mode/i,
  /god\s+mode/i
];

// Forbidden Keywords in Generated Code
const FORBIDDEN_KEYWORDS = [
  'eval',
  'Function(',
  'dangerouslySetInnerHTML',
  'innerHTML',
  'appendChild',
  'insertAdjacentHTML',
  'onclick=',
  'onload=',
  'fetch(',
  'axios',
  'XMLHttpRequest',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'require(',
  'eval(',
  'constructor',
  'prototype',
  '__proto__',
  'document.write',
  'window.',
  'global.',
  'process.',
  'child_process',
  'fs.',
  'path.',
  'os.'
];

// Note: `import`/`export` keywords are commonly present in generated module code
// (ESM) and are not inherently dangerous in the generation output. We allow them
// but continue to block runtime APIs and filesystem/child process access above.

/**
 * Check user input for prompt injection attempts
 */
export function detectPromptInjection(input: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      violations.push({
        type: 'injection',
        message: `Detected potential prompt injection: "${matches[0]}"`,
        content: matches[0]
      });
    }
  }

  return violations;
}

/**
 * Check generated code for forbidden keywords
 */
export function detectForbiddenKeywords(code: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
    const matches = code.match(regex) || [];

    if (matches.length > 0) {
      violations.push({
        type: 'forbidden_keyword',
        message: `Found forbidden keyword: "${keyword}"`,
        content: keyword
      });
    }
  }

  return violations;
}

/**
 * Check for inline style injection
 */
export function detectInlineStyles(code: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  const stylePattern = /style\s*=\s*\{/gi;
  const matches = code.match(stylePattern) || [];

  if (matches.length > 0) {
    violations.push({
      type: 'forbidden_keyword',
      message: `Inline styles detected (not allowed)`,
      content: 'style={}'
    });
  }

  return violations;
}

/**
 * Check for dangerous props
 */
export function detectDangerousProps(code: string): SecurityViolation[] {
  const violations: SecurityViolation[] = [];

  const dangerousProps = ['dangerouslySetInnerHTML', 'onClick', 'onChange'];

  for (const prop of dangerousProps) {
    const pattern = new RegExp(`${prop}\\s*=`, 'i');
    if (pattern.test(code)) {
      violations.push({
        type: 'forbidden_keyword',
        message: `Dangerous prop detected: "${prop}"`,
        content: prop
      });
    }
  }

  return violations;
}

/**
 * Perform comprehensive security check
 */
export function performSecurityCheck(
  userInput: string,
  generatedCode: string
): SecurityCheckResult {
  const violations: SecurityViolation[] = [];

  // Check user input for injection
  violations.push(...detectPromptInjection(userInput));

  // Check generated code
  violations.push(...detectForbiddenKeywords(generatedCode));
  violations.push(...detectInlineStyles(generatedCode));
  violations.push(...detectDangerousProps(generatedCode));

  return {
    safe: violations.length === 0,
    violations
  };
}

/**
 * Sanitize user input - remove potentially dangerous patterns
 */
export function sanitizeInput(input: string): string {
  let sanitized = input;

  // Remove common injection patterns
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  sanitized = sanitized.substring(0, 5000); // Limit length

  return sanitized;
}

/**
 * Validate component name against whitelist
 */
export function isValidComponentName(name: string): boolean {
  // Component names must be PascalCase
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Check if string contains HTML/JSX tags
 */
export function containsHTMLTags(str: string): boolean {
  return /<[a-zA-Z][^>]*>/g.test(str);
}

/**
 * Validate JSON safety - prevent code injection in JSON
 */
export function validateJSONSafety(obj: any): boolean {
  const jsonStr = JSON.stringify(obj);

  // Check for dangerous patterns
  if (detectForbiddenKeywords(jsonStr).length > 0) {
    return false;
  }

  return true;
}
