import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Button = ({ children, variant = 'primary', disabled = false, fullWidth = false, onClick }) => (_jsx("button", { className: `btn btn-${variant} ${fullWidth ? 'w-full' : ''}`, disabled: disabled, onClick: onClick, children: children }));
export const Card = ({ title, subtitle, children }) => (_jsxs("div", { className: "card", children: [title && _jsx("h3", { children: title }), subtitle && _jsx("p", { className: "subtitle", children: subtitle }), children] }));
export const Header = ({ title, subtitle, showNav }) => (_jsxs("header", { className: "header", children: [_jsx("h1", { children: title }), subtitle && _jsx("p", { className: "subtitle", children: subtitle }), showNav && (_jsxs("nav", { className: "nav", children: [_jsx("a", { href: "#home", children: "Home" }), _jsx("a", { href: "#about", children: "About" }), _jsx("a", { href: "#contact", children: "Contact" })] }))] }));
export const Input = ({ label, type = 'text', placeholder, required = false, disabled = false, value, onChange }) => (_jsxs("div", { className: "form-group", children: [label && _jsx("label", { children: label }), _jsx("input", { type: type, placeholder: placeholder, required: required, disabled: disabled, value: value, onChange: e => onChange?.(e.target.value) })] }));
export const Select = ({ label, options, required = false, disabled = false, value, onChange }) => (_jsxs("div", { className: "form-group", children: [label && _jsx("label", { children: label }), _jsxs("select", { required: required, disabled: disabled, value: value, onChange: e => onChange?.(e.target.value), children: [_jsx("option", { value: "", children: "Select..." }), options.map(opt => (_jsx("option", { value: opt, children: opt }, opt)))] })] }));
export const TextArea = ({ label, placeholder, rows = 4, required = false, value, onChange }) => (_jsxs("div", { className: "form-group", children: [label && _jsx("label", { children: label }), _jsx("textarea", { placeholder: placeholder, rows: rows, required: required, value: value, onChange: e => onChange?.(e.target.value) })] }));
export const Modal = ({ title, open, onClose, children }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: title }), _jsx("button", { className: "modal-close", onClick: onClose, children: "\u00D7" })] }), _jsx("div", { className: "modal-body", children: children })] }) }));
};
export const List = ({ items, renderItem }) => (_jsx("ul", { className: "list", children: items.map((item, index) => (_jsx("li", { children: renderItem(item) }, index))) }));
export const Grid = ({ columns, gap = 'md', children }) => (_jsx("div", { className: `grid grid-${columns} gap-${gap}`, children: children }));
export const Stack = ({ direction, spacing = 'md', children }) => (_jsx("div", { className: `stack stack-${direction} spacing-${spacing}`, children: children }));
export const Alert = ({ message, type = 'info' }) => (_jsx("div", { className: `alert alert-${type}`, children: message }));
export const Divider = ({ spacing = 'md' }) => (_jsx("div", { className: `divider divider-${spacing}` }));
export const Text = ({ content, variant = 'body' }) => (_jsx("p", { className: `text text-${variant}`, children: content }));
