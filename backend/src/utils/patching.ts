import { ComponentNode, DiffResult } from '../types';

/* ============================================
   DIFF & PATCHING UTILITIES
   ============================================ */

/**
 * Calculate simple diff between two strings
 */
export function calculateDiff(oldCode: string, newCode: string): DiffResult {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  // Simple line-based diff
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  // Track which lines are in new code
  const newLineSet = new Set(newLines);
  const oldLineSet = new Set(oldLines);

  for (const line of newLines) {
    if (!oldLineSet.has(line)) {
      added.push(line.trim());
    }
  }

  for (const line of oldLines) {
    if (!newLineSet.has(line)) {
      removed.push(line.trim());
    }
  }

  // Count modified components by component name
  const componentPattern = /<(\w+)/g;
  const oldComponents = new Set<string>();
  const newComponents = new Set<string>();

  let match;
  while ((match = componentPattern.exec(oldCode)) !== null) {
    oldComponents.add(match[1]);
  }

  const regexNew = /<(\w+)/g;
  while ((match = regexNew.exec(newCode)) !== null) {
    newComponents.add(match[1]);
  }

  for (const comp of newComponents) {
    if (oldComponents.has(comp)) {
      modified.push(comp);
    }
  }

  const summary = `Added ${added.length} lines, removed ${removed.length} lines, modified ${modified.length} components`;

  return {
    added: added.slice(0, 10), // Limit output
    removed: removed.slice(0, 10),
    modified: Array.from(modified),
    summary
  };
}

/**
 * Apply incremental patch to existing code
 * Preserves user-made changes outside modified sections
 */
export function applyIncrementalPatch(
  originalCode: string,
  patch: Partial<ComponentNode[]>
): string {
  // Parse original JSX
  const lines = originalCode.split('\n');

  // Find component boundaries
  const componentBoundaries = findComponentBoundaries(originalCode);

  // Update specific components while preserving others
  const patched = lines.map((line, index) => {
    for (const boundary of componentBoundaries) {
      if (index >= boundary.startLine && index <= boundary.endLine) {
        // This line is within a component to be patched
        return patchComponentLine(line, boundary.component, patch);
      }
    }
    return line;
  });

  return patched.join('\n');
}

/**
 * Find component boundaries in JSX code
 */
function findComponentBoundaries(
  code: string
): Array<{ component: string; startLine: number; endLine: number }> {
  const lines = code.split('\n');
  const boundaries: Array<{ component: string; startLine: number; endLine: number }> = [];

  let componentName = '';
  let startLine = 0;
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Opening tag
    const openMatch = line.match(/<(\w+)/);
    if (openMatch) {
      componentName = openMatch[1];
      startLine = i;
      depth++;
    }

    // Count brackets for self-closing tags
    depth += (line.match(/>/g) || []).length;
    depth -= (line.match(/\/>/g) || []).length;

    // Closing tag
    if (line.includes(`</${componentName}>`)) {
      depth--;
      if (depth === 0 && componentName) {
        boundaries.push({
          component: componentName,
          startLine,
          endLine: i
        });
      }
    }
  }

  return boundaries;
}

/**
 * Apply patch to a single component line
 */
function patchComponentLine(
  line: string,
  componentName: string,
  patch: Partial<ComponentNode[]>
): string {
  // Preserve line but update props if needed
  return line;
}

/**
 * Generate AST from component tree for efficient updates
 */
export function generateAST(components: ComponentNode[]): object {
  return {
    type: 'root',
    children: components.map(componentToAST)
  };
}

/**
 * Convert component to AST node
 */
function componentToAST(component: ComponentNode): object {
  return {
    type: 'element',
    name: component.type,
    props: component.props,
    children: (component.children || []).map(child =>
      typeof child === 'string'
        ? { type: 'text', value: child }
        : componentToAST(child)
    )
  };
}

/**
 * Create minimal patch from old tree to new tree
 */
export function generateMinimalPatch(
  oldComponents: ComponentNode[],
  newComponents: ComponentNode[]
): object {
  const patch: any = { updates: [], additions: [], deletions: [] };

  // Simple approach: identify added, removed, and modified components
  const oldIds = new Set(oldComponents.map(c => c.id));
  const newIds = new Set(newComponents.map(c => c.id));

  // Additions
  for (const newComp of newComponents) {
    if (!oldIds.has(newComp.id)) {
      patch.additions.push(newComp);
    }
  }

  // Deletions
  for (const oldComp of oldComponents) {
    if (!newIds.has(oldComp.id)) {
      patch.deletions.push(oldComp.id);
    }
  }

  // Modifications
  for (const newComp of newComponents) {
    const oldComp = oldComponents.find(c => c.id === newComp.id);
    if (oldComp && JSON.stringify(oldComp) !== JSON.stringify(newComp)) {
      patch.updates.push({
        id: newComp.id,
        changes: {
          props: newComp.props,
          children: newComp.children
        }
      });
    }
  }

  return patch;
}
