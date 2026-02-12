import { JSXAnalysisResult, ValidationError, ValidationResult } from '../types';
import { isComponentWhitelisted, getComponentSchema } from '../types/componentLibrary';

/* ============================================
   JSX & CODE ANALYSIS
   ============================================ */

/**
 * Analyze generated JSX code for safety and validity
 */
export function analyzeJSX(code: string): JSXAnalysisResult {
  const errors: string[] = [];
  const components = new Set<string>();

  let hasUnwhitelistedComponents = false;
  let hasInlineStyles = false;
  let hasForbiddenKeywords = false;

  // Extract component names from JSX
  const componentPattern = /<(\w+)[\s>]/g;
  let match;

  while ((match = componentPattern.exec(code)) !== null) {
    const componentName = match[1];

    // Skip HTML elements and fragments
    if (isHTMLElement(componentName) || componentName === 'Fragment') {
      continue;
    }

    components.add(componentName);

    // Check if component is whitelisted
    if (!isComponentWhitelisted(componentName)) {
      hasUnwhitelistedComponents = true;
      errors.push(`Component "${componentName}" is not whitelisted`);
    }
  }

  // Check for inline styles
  if (/style\s*=\s*\{/.test(code)) {
    hasInlineStyles = true;
    errors.push('Inline styles (style={}) are not allowed');
  }

  // Check for forbidden keywords
  const forbiddenKeywords = [
    'dangerouslySetInnerHTML',
    'onClick',
    'eval',
    'fetch',
    'setTimeout'
  ];

  for (const keyword of forbiddenKeywords) {
    if (code.includes(keyword)) {
      hasForbiddenKeywords = true;
      errors.push(`Forbidden keyword detected: "${keyword}"`);
    }
  }

  // Validate JSX syntax
  if (!isValidJSXSyntax(code)) {
    errors.push('Invalid JSX syntax');
  }

  return {
    components: Array.from(components),
    hasUnwhitelistedComponents,
    hasInlineStyles,
    hasForbiddenKeywords,
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if string is an HTML element
 */
function isHTMLElement(tag: string): boolean {
  const htmlElements = [
    'div', 'span', 'p', 'a', 'button', 'input', 'form', 'label',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'table', 'tr', 'td', 'thead', 'tbody', 'footer', 'header',
    'main', 'section', 'article', 'nav', 'aside', 'img', 'video'
  ];
  return htmlElements.includes(tag.toLowerCase());
}

/**
 * Basic JSX syntax validation
 */
function isValidJSXSyntax(code: string): boolean {
  // Improved JSX syntax validation supporting:
  // - Self-closing tags (<Tag />)
  // - Fragment shorthand (<>...</>)
  // - Nested tags
  const stack: string[] = [];
  const tagRegex = /<(\/?)([A-Za-z0-9_:-]+)?([^>]*)>/g;

  let match;
  while ((match = tagRegex.exec(code)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2]; // undefined for fragments like <> or </>
    const rest = match[3] || '';

    const selfClosing = /\/\s*$/.test(rest) || /\/\s*>$/.test(match[0]);

    if (!tagName) {
      // Fragment shorthand
      if (isClosing) {
        if (stack.length === 0 || stack[stack.length - 1] !== 'Fragment') return false;
        stack.pop();
      } else {
        if (!selfClosing) stack.push('Fragment');
      }
      continue;
    }

    if (isClosing) {
      if (stack.length === 0 || stack[stack.length - 1] !== tagName) {
        return false;
      }
      stack.pop();
    } else {
      if (!selfClosing) stack.push(tagName);
    }
  }

  return stack.length === 0;
}

/**
 * Validate component props against schema
 */
export function validateComponentProps(
  componentName: string,
  props: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const schema = getComponentSchema(componentName);

  if (!schema) {
    errors.push({
      path: componentName,
      message: `Component "${componentName}" not found in whitelist`,
      severity: 'error'
    });
    return errors;
  }

  // Check required props
  for (const [propName, propSchema] of Object.entries(schema.props)) {
    if (propSchema.required && !(propName in props)) {
      errors.push({
        path: `${componentName}.${propName}`,
        message: `Required prop "${propName}" is missing`,
        severity: 'error'
      });
    }

    // Check prop type and values
    if (propName in props) {
      const value = props[propName];
      const error = validatePropValue(propName, value, propSchema);
      if (error) {
        errors.push({
          path: `${componentName}.${propName}`,
          message: error,
          severity: 'error'
        });
      }
    }
  }

  return errors;
}

/**
 * Validate a single prop value
 */
function validatePropValue(propName: string, value: any, schema: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        return `Expected string, got ${typeof value}`;
      }
      return null;

    case 'number':
      if (typeof value !== 'number') {
        return `Expected number, got ${typeof value}`;
      }
      return null;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return `Expected boolean, got ${typeof value}`;
      }
      return null;

    case 'enum':
      if (!schema.values.includes(value)) {
        return `Value must be one of: ${schema.values.join(', ')}`;
      }
      return null;

    case 'array':
      if (!Array.isArray(value)) {
        return `Expected array, got ${typeof value}`;
      }
      return null;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return `Expected object, got ${typeof value}`;
      }
      return null;

    default:
      return null;
  }
}

/**
 * Extract all components from JSX code
 */
export function extractComponentsFromJSX(code: string): string[] {
  const components = new Set<string>();
  const componentPattern = /<(\w+)[\s>]/g;

  let match;
  while ((match = componentPattern.exec(code)) !== null) {
    const componentName = match[1];
    if (!isHTMLElement(componentName)) {
      components.add(componentName);
    }
  }

  return Array.from(components);
}

/**
 * Validate entire component tree
 */
export function validateComponentTree(components: any[]): ValidationResult {
  const errors: ValidationError[] = [];

  for (const component of components) {
    if (!isComponentWhitelisted(component.type)) {
      errors.push({
        path: component.id,
        message: `Component type "${component.type}" is not whitelisted`,
        severity: 'error'
      });
      continue;
    }

    // Validate props
    const propErrors = validateComponentProps(component.type, component.props);
    errors.push(...propErrors);

    // Recursively validate children
    if (component.children && Array.isArray(component.children)) {
      const childComponents = component.children.filter((c: any) => typeof c === 'object');
      const childErrors = validateComponentTree(childComponents);
      errors.push(...childErrors.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
