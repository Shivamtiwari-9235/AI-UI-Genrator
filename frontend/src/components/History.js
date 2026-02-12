import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Stack, Button } from './library';
export const VersionHistory = ({ versions, currentVersionId, onSelectVersion, onReplay }) => {
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };
    if (versions.length === 0) {
        return (_jsx(Card, { title: "Version History", children: _jsx("div", { style: { color: '#999', textAlign: 'center', padding: '24px' }, children: "No versions yet. Generate a UI to start." }) }));
    }
    return (_jsx(Card, { title: "Version History", subtitle: `${versions.length} versions saved`, children: _jsxs(Stack, { direction: "vertical", spacing: "md", children: [onReplay && (_jsx(Button, { variant: "secondary", onClick: onReplay, children: "\u25B6\uFE0F Replay All Generations" })), _jsx("div", { style: { overflowY: 'auto', maxHeight: '400px' }, children: versions.map((version, idx) => (_jsxs("div", { style: {
                            padding: '12px',
                            border: currentVersionId === version.id ? '2px solid #007bff' : '1px solid #ddd',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            background: currentVersionId === version.id ? '#f0f7ff' : 'white',
                            transition: 'all 0.2s'
                        }, onClick: () => onSelectVersion?.(version.id), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }, children: [_jsxs("strong", { children: ["v", versions.length - idx] }), _jsx("span", { style: { fontSize: '12px', color: '#999' }, children: formatDate(version.timestamp) })] }), _jsxs("p", { style: { fontSize: '14px', marginBottom: '8px' }, children: [version.userMessage.substring(0, 60), version.userMessage.length > 60 ? '...' : ''] }), _jsxs("div", { style: { fontSize: '12px', color: '#666', display: 'flex', gap: '16px' }, children: [_jsxs("span", { children: ["Intent: ", version.metadata.intent] }), _jsxs("span", { children: [version.metadata.componentCount, " components"] }), _jsxs("span", { children: [version.metadata.linesOfCode, " LOC"] })] })] }, version.id))) })] }) }));
};
export const Explanation = ({ explanation }) => {
    if (!explanation) {
        return (_jsx(Card, { title: "Generation Explanation", children: _jsx("div", { style: { color: '#999', textAlign: 'center', padding: '24px' }, children: "No explanation available" }) }));
    }
    return (_jsx(Card, { title: "Generation Explanation", children: _jsxs(Stack, { direction: "vertical", spacing: "md", children: [_jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Layout Reasoning" }), _jsx("p", { style: { color: '#666', fontSize: '14px' }, children: explanation.layoutReasoning })] }), _jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Component Selection" }), _jsx("ul", { style: { fontSize: '14px', color: '#666', paddingLeft: '20px' }, children: Object.entries(explanation.componentSelectionReasoning).map(([comp, reason]) => (_jsxs("li", { style: { marginBottom: '8px' }, children: [_jsxs("strong", { children: [comp, ":"] }), " ", reason] }, comp))) })] }), explanation.modificationReasoning && (_jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Modifications" }), _jsx("p", { style: { color: '#666', fontSize: '14px' }, children: explanation.modificationReasoning })] })), _jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Tradeoffs" }), _jsx("ul", { style: { fontSize: '14px', color: '#666', paddingLeft: '20px' }, children: explanation.tradeoffs.map((tradeoff, idx) => (_jsx("li", { style: { marginBottom: '8px' }, children: tradeoff }, idx))) })] }), _jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "Constraints" }), _jsx("ul", { style: { fontSize: '14px', color: '#666', paddingLeft: '20px' }, children: explanation.constraints.map((constraint, idx) => (_jsx("li", { style: { marginBottom: '8px' }, children: constraint }, idx))) })] })] }) }));
};
