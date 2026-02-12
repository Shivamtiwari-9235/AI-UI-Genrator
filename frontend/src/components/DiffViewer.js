import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, Stack, Button } from './library';
export const CodeViewer = ({ code, language = 'typescript' }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    if (!code) {
        return (_jsx(Card, { title: "Generated Code", children: _jsx("div", { style: { color: '#999', textAlign: 'center', padding: '40px' }, children: "No code generated yet" }) }));
    }
    return (_jsx(Card, { title: "Generated Code", subtitle: `Language: ${language}`, children: _jsxs(Stack, { direction: "vertical", spacing: "md", children: [_jsx(Button, { variant: "secondary", onClick: handleCopy, children: copied ? '✓ Copied' : 'Copy Code' }), _jsx("div", { style: {
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: '16px',
                        borderRadius: '4px',
                        overflowX: 'auto',
                        fontFamily: 'Menlo, Monaco, Courier New, monospace',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }, children: _jsx("pre", { style: { margin: 0 }, children: _jsx("code", { children: code }) }) }), _jsxs("div", { style: { fontSize: '12px', color: '#999' }, children: [_jsx("p", { children: "\uD83D\uDCCB Code is generated and validated against component schema" }), _jsx("p", { children: "\uD83D\uDD12 No inline styles, external libraries, or dangerous patterns allowed" }), _jsx("p", { children: "\u2705 Safe to use in production after proper integration" })] })] }) }));
};
export const DiffViewer = ({ oldCode, newCode }) => {
    if (!oldCode || !newCode) {
        return (_jsx(Card, { title: "Diff Viewer", children: _jsx("div", { style: { color: '#999', textAlign: 'center', padding: '40px' }, children: "No comparison available" }) }));
    }
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    return (_jsx(Card, { title: "Changes", subtitle: "Diff from previous version", children: _jsxs("div", { style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxHeight: '400px',
                overflowY: 'auto'
            }, children: [_jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px', fontSize: '12px', color: '#666' }, children: "Previous" }), _jsxs("div", { style: {
                                background: '#f5f5f5',
                                padding: '12px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }, children: [oldLines.slice(0, 20).join('\n'), oldLines.length > 20 && `\n... and ${oldLines.length - 20} more lines`] })] }), _jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px', fontSize: '12px', color: '#666' }, children: "Current" }), _jsxs("div", { style: {
                                background: '#f5f5f5',
                                padding: '12px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }, children: [newLines.slice(0, 20).join('\n'), newLines.length > 20 && `\n... and ${newLines.length - 20} more lines`] })] })] }) }));
};
