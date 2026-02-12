import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import type * as t from '@babel/types';

export type PatchResult = { code: string; success: boolean; message?: string };

/**
 * Minimal AST-based patcher that attempts to preserve file-level imports and replace
 * the root JSX element children with a new AST's root JSX children.
 * NOTE: This is a demonstrator; for production use a robust AST-diff library.
 */
export function applyAstPatch(oldCode: string, newCode: string): PatchResult {
  try {
    const oldAst = parse(oldCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] }) as unknown as t.File;
    const newAst = parse(newCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] }) as unknown as t.File;

    let replaced = false;

    // Find top-level JSX element in oldAst and newAst
    let oldJSX: t.JSXElement | t.JSXFragment | null = null;
    let newJSX: t.JSXElement | t.JSXFragment | null = null;

    traverse(oldAst, {
      JSXElement(path) {
        if (!oldJSX) oldJSX = path.node;
      },
      JSXFragment(path) {
        if (!oldJSX) oldJSX = path.node as any;
      },
      noScope: true,
    });

    traverse(newAst, {
      JSXElement(path) {
        if (!newJSX) newJSX = path.node;
      },
      JSXFragment(path) {
        if (!newJSX) newJSX = path.node as any;
      },
      noScope: true,
    });

    if (oldJSX && newJSX) {
      traverse(oldAst, {
        JSXElement(path) {
          if (path.node === oldJSX) {
            path.replaceWith(newJSX!);
            replaced = true;
            path.stop();
          }
        },
        JSXFragment(path) {
          if (path.node === oldJSX) {
            path.replaceWith(newJSX!);
            replaced = true;
            path.stop();
          }
        },
        noScope: true,
      });
    }

    if (!replaced) {
      // fallback: return newCode unchanged but indicate that we couldn't patch incrementally
      return { code: newCode, success: true, message: 'Fallback: replaced entire file (no incremental patch possible).' };
    }

    const out = generate(oldAst, { retainLines: true }, oldCode);
    return { code: out.code, success: true };
  } catch (err: any) {
    return { code: newCode, success: false, message: String(err.message || err) };
  }
}

export default applyAstPatch;
