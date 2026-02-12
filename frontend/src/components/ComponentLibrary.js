import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, Stack, Alert } from './library';
const DEFAULT_COMPONENTS = [
    {
        name: 'Header',
        description: 'Page header with optional navigation',
        props: ['title', 'subtitle', 'showNav']
    },
    {
        name: 'Card',
        description: 'Content container with elevation',
        props: ['title', 'subtitle', 'children']
    },
    {
        name: 'Button',
        description: 'Interactive button with variants',
        props: ['children', 'variant', 'disabled', 'fullWidth']
    },
    {
        name: 'Input',
        description: 'Text input field with type variants',
        props: ['label', 'type', 'placeholder', 'required']
    },
    {
        name: 'Select',
        description: 'Dropdown selector',
        props: ['label', 'options', 'required']
    },
    {
        name: 'TextArea',
        description: 'Multi-line text input',
        props: ['label', 'placeholder', 'rows', 'required']
    },
    {
        name: 'Stack',
        description: 'Directional layout container',
        props: ['direction', 'spacing', 'children']
    },
    {
        name: 'Grid',
        description: 'CSS Grid layout',
        props: ['columns', 'gap', 'children']
    },
    {
        name: 'Modal',
        description: 'Dialog overlay',
        props: ['title', 'open', 'onClose', 'children']
    },
    {
        name: 'List',
        description: 'Iterable list component',
        props: ['items', 'renderItem']
    },
    {
        name: 'Alert',
        description: 'Alert/notification message',
        props: ['message', 'type']
    },
    {
        name: 'Divider',
        description: 'Visual separator',
        props: ['spacing']
    }
];
export const ComponentLibrary = () => {
    const [selectedComponent, setSelectedComponent] = React.useState(null);
    const selected = DEFAULT_COMPONENTS.find(c => c.name === selectedComponent);
    return (_jsx(Card, { title: "Component Library", subtitle: "Whitelisted deterministic components", children: _jsxs(Stack, { direction: "vertical", spacing: "md", children: [_jsx(Alert, { message: "All available components are pre-defined. Custom components cannot be added.", type: "info" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }, children: DEFAULT_COMPONENTS.map(comp => (_jsx("button", { onClick: () => setSelectedComponent(comp.name), style: {
                            padding: '12px',
                            border: selectedComponent === comp.name ? '2px solid #007bff' : '1px solid #ddd',
                            borderRadius: '4px',
                            background: selectedComponent === comp.name ? '#f0f7ff' : 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: selectedComponent === comp.name ? 600 : 400,
                            transition: 'all 0.2s'
                        }, children: comp.name }, comp.name))) }), selected && (_jsxs("div", { style: { borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }, children: [_jsx("h3", { style: { marginBottom: '8px' }, children: selected.name }), _jsx("p", { style: { color: '#666', marginBottom: '16px' }, children: selected.description }), _jsx("h4", { style: { marginBottom: '8px', fontSize: '14px' }, children: "Props" }), _jsx("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '8px'
                            }, children: selected.props.map(prop => (_jsx("div", { style: {
                                    background: '#f5f5f5',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontFamily: 'monospace'
                                }, children: prop }, prop))) }), _jsx("div", { style: { marginTop: '16px', fontSize: '12px', color: '#999' }, children: _jsx("p", { children: "See README for complete component schema and constraints." }) })] }))] }) }));
};
