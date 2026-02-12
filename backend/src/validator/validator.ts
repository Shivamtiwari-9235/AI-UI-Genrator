import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export type ValidationError = {
  type: 'ForbiddenImport' | 'DynamicRequire' | 'EvalUsage' | 'InlineScript' | 'ForbiddenGlobal' | 'UnknownComponent' | 'UnknownProp' | 'Other';
  location: { line: number; column: number } | null;
  message: string;
  nodeType?: string;
};

import { componentManifest } from '../manifest/component-manifest';

export function validateJSX(code: string) {
  const errors: ValidationError[] = [];

  let ast: any = null;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
    }) as any;
  } catch (err: any) {
    return { valid: false, errors: [{ type: 'Other', location: null, message: 'Parse error: ' + String(err.message) }] };
  }

  traverse(ast, {
    ImportDeclaration(path: any) {
      const source = path.node.source.value;
      if (!componentManifest.allowedImports.includes(source)) {
        errors.push({
          type: 'ForbiddenImport',
          location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
          message: `Import from '${source}' is not allowed.`,
          nodeType: 'ImportDeclaration',
        });
      }
    },
    CallExpression(path: any) {
      const callee = path.node.callee;
      // detect require('...')
      if (t.isIdentifier(callee) && callee.name === 'require') {
        errors.push({
          type: 'DynamicRequire',
          location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
          message: 'Dynamic require() is disallowed.',
          nodeType: 'CallExpression',
        });
      }
      // detect eval
      if (t.isIdentifier(callee) && callee.name === 'eval') {
        errors.push({
          type: 'EvalUsage',
          location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
          message: 'eval() usage is disallowed.',
          nodeType: 'CallExpression',
        });
      }
    },
    JSXAttribute(path: any) {
      const name = path.node.name;
      if (t.isJSXIdentifier(name)) {
        const attrName = name.name;
        // Inline event handlers like onClick="..."
        if (/^on[A-Z]/.test(attrName)) {
          if (t.isStringLiteral(path.node.value) || t.isJSXExpressionContainer(path.node.value) && t.isStringLiteral(path.node.value.expression)) {
            errors.push({
              type: 'InlineScript',
              location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
              message: `Inline event handlers are disallowed (attribute=${attrName}).`,
              nodeType: 'JSXAttribute',
            });
          }
        }
        // inline style object or literal disallowed
        if (attrName === 'style') {
          errors.push({
            type: 'InlineScript',
            location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
            message: 'Inline style attributes are disallowed. Use manifest-controlled props or CSS classes.',
            nodeType: 'JSXAttribute',
          });
        }
        // forbidden props enforcement via manifest
        const parent = path.parentPath && path.parentPath.node;
        if (t.isJSXOpeningElement(parent) && parent.name && t.isJSXIdentifier(parent.name)) {
          const compName = parent.name.name;
          const manifestEntry = componentManifest.allowedComponents[compName];
          if (!manifestEntry) {
            errors.push({
              type: 'UnknownComponent',
              location: parent.loc ? { line: parent.loc.start.line, column: parent.loc.start.column } : null,
              message: `Component '${compName}' is not in the allowed component manifest.`,
              nodeType: 'JSXOpeningElement',
            });
          } else {
            const allowed = manifestEntry.props || [];
            if (t.isJSXIdentifier(name) && !allowed.includes(attrName)) {
              errors.push({
                type: 'UnknownProp',
                location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
                message: `Prop '${attrName}' is not allowed on component '${compName}'.`,
                nodeType: 'JSXAttribute',
              });
            }
          }
        }
      }
    },
    MemberExpression(path: any) {
      // detect window.document or global DOM access
      const object = path.node.object;
      if (t.isIdentifier(object) && (object.name === 'window' || object.name === 'document' || object.name === 'globalThis')) {
        errors.push({
          type: 'ForbiddenGlobal',
          location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
          message: `Access to global '${object.name}' is disallowed in generated code.`,
          nodeType: 'MemberExpression',
        });
      }
    },
    Identifier(path: any) {
      if (path.node.name === 'eval') {
        errors.push({
          type: 'EvalUsage',
          location: path.node.loc ? { line: path.node.loc.start.line, column: path.node.loc.start.column } : null,
          message: 'eval identifier usage is disallowed.',
          nodeType: 'Identifier',
        });
      }
    },
  });

  return { valid: errors.length === 0, errors };
}

export default validateJSX;
