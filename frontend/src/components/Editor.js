import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, Stack, Alert, TextArea } from './library';
export const Editor = ({ onGenerate, isLoading, error }) => {
    const [message, setMessage] = useState('');
    const [selectedIntent, setSelectedIntent] = useState('auto');
    const handleGenerate = () => {
        if (message.trim()) {
            onGenerate(message);
        }
    };
    const examplePrompts = [
        'Create a login form with email and password fields',
        'Build a product card with description and price',
        'Design a contact form with name, email, message',
        'Create a navigation header with menu items',
        'Build a settings panel with toggles and options'
    ];
    return (_jsx(Card, { title: "UI Generator", subtitle: "Deterministic AI-powered generation", children: _jsxs(Stack, { direction: "vertical", spacing: "md", children: [error && _jsx(Alert, { message: error, type: "error" }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 500, marginBottom: '8px', display: 'block' }, children: "Your Request" }), _jsx(TextArea, { placeholder: "Describe the UI you want to generate...", rows: 4, value: message, onChange: setMessage })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 500, marginBottom: '8px', display: 'block' }, children: "Intent (Optional)" }), _jsxs("select", { value: selectedIntent, onChange: e => setSelectedIntent(e.target.value), style: { width: '100%', padding: '8px', borderRadius: '4px' }, children: [_jsx("option", { value: "auto", children: "Auto-Detect" }), _jsx("option", { value: "create", children: "Create New" }), _jsx("option", { value: "modify", children: "Modify Existing" }), _jsx("option", { value: "regenerate", children: "Regenerate" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { fontWeight: 500, marginBottom: '8px', display: 'block' }, children: "Example Prompts" }), _jsx(Stack, { direction: "vertical", spacing: "sm", children: examplePrompts.map((prompt, idx) => (_jsx("button", { onClick: () => setMessage(prompt), style: {
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '12px'
                                }, children: prompt }, idx))) })] }), _jsx(Button, { variant: "primary", fullWidth: true, onClick: handleGenerate, disabled: !message.trim() || isLoading, children: isLoading ? 'Generating...' : 'Generate UI' })] }) }));
};
