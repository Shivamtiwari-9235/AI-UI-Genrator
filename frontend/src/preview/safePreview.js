import { jsx as _jsx } from "react/jsx-runtime";
function stripScriptsAndHandlers(html) {
    // Remove <script> blocks
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // Remove inline event handlers (onClick=, onMouse...)
    out = out.replace(/\son[A-Za-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    return out;
}
export const SafePreview = ({ sanitizedHtml, title }) => {
    const clean = stripScriptsAndHandlers(sanitizedHtml);
    // enforce strict CSP via meta tag in srcDoc and disable scripts/same-origin by sandbox
    const srcDoc = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src data:; frame-ancestors 'none';"><meta charset="utf-8"><title>${(title || 'preview')}</title></head><body>${clean}</body></html>`;
    return (_jsx("iframe", { title: title || 'safe-preview', srcDoc: srcDoc, sandbox: "allow-forms allow-popups allow-modals", style: { width: '100%', height: '100%', border: '0' } }));
};
export default SafePreview;
