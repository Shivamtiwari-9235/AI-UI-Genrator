import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Button, Modal } from '../components/library';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { CodeViewer, DiffViewer } from '../components/DiffViewer';
// History components not used in this refactor
import { useGeneration, useVersionHistory } from '../hooks/useGeneration';
import '../styles/index.css';
export const App = () => {
    const [activeTab, setActiveTab] = useState('code');
    const [showModal, setShowModal] = useState(false);
    const [pipelineStep, setPipelineStep] = useState('idle');
    const [toast, setToast] = useState(null);
    const [expandedPlan, setExpandedPlan] = useState(false);
    const [expandedExplanation, setExpandedExplanation] = useState(false);
    const { generation, isLoading, error: generationError, generate } = useGeneration();
    const { versions, fetchVersions } = useVersionHistory();
    const [currentVersionId, setCurrentVersionId] = useState();
    const chatContainerRef = useRef(null);
    // Fetch versions on mount
    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);
    // Refresh versions after generation
    useEffect(() => {
        if (generation?.id) {
            fetchVersions();
            setCurrentVersionId(generation.id);
        }
    }, [generation, fetchVersions]);
    // Auto-scroll to latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [generation, isLoading]);
    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    const handleGenerate = useCallback(async (message) => {
        try {
            setPipelineStep('intent');
            setTimeout(() => setPipelineStep('planner'), 500);
            setTimeout(() => setPipelineStep('generator'), 1000);
            setTimeout(() => setPipelineStep('explainer'), 1500);
            await generate(message, currentVersionId);
            setPipelineStep('idle');
            setToast({ message: 'Generation complete!', type: 'success' });
        }
        catch (err) {
            console.error('Generation failed:', err);
            setToast({ message: 'Generation failed', type: 'error' });
            setPipelineStep('idle');
        }
    }, [generate, currentVersionId]);
    const handleSelectVersion = useCallback((versionId) => {
        setCurrentVersionId(versionId);
    }, []);
    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const textarea = document.querySelector('textarea');
            if (textarea && textarea.value.trim()) {
                handleGenerate(textarea.value);
            }
        }
    }, [handleGenerate]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    const componentCount = generation?.plan?.components?.length || 0;
    return (_jsxs("div", { className: "app-container", children: [_jsxs("div", { className: "sidebar-left", children: [_jsxs("div", { className: "sidebar-header", children: [_jsxs("div", { className: "app-logo", children: [_jsx("div", { className: "app-logo-icon", children: "\u2728" }), _jsx("div", { className: "app-logo-text", children: "AI UI Gen" })] }), _jsxs("div", { className: "status-badge success", children: [_jsx("span", { children: "\u25CF" }), "Deterministic Mode"] })] }), _jsx("div", { className: "version-list", children: versions.length === 0 ? (_jsx("div", { style: { padding: '16px 12px', color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center' }, children: "No versions yet" })) : (versions.map((v, idx) => (_jsxs("div", { className: `version-item ${v.id === currentVersionId ? 'active' : ''}`, onClick: () => handleSelectVersion(v.id), children: [_jsxs("div", { style: { fontWeight: 500 }, children: ["v", versions.length - idx] }), _jsx("div", { className: "version-item-time", children: new Date(v.timestamp).toLocaleTimeString() })] }, v.id)))) })] }), _jsxs("div", { className: "panel-center", children: [_jsx("div", { className: "chat-header", children: _jsxs("div", { className: "pipeline-indicator", children: [_jsx("div", { className: `pipeline-step ${pipelineStep === 'intent' ? 'active' : ''}`, children: "\u2460 Intent" }), _jsx("div", { className: "pipeline-separator" }), _jsx("div", { className: `pipeline-step ${pipelineStep === 'planner' ? 'active' : ''}`, children: "\u2461 Planner" }), _jsx("div", { className: "pipeline-separator" }), _jsx("div", { className: `pipeline-step ${pipelineStep === 'generator' ? 'active' : ''}`, children: "\u2462 Generator" }), _jsx("div", { className: "pipeline-separator" }), _jsx("div", { className: `pipeline-step ${pipelineStep === 'explainer' ? 'active' : ''}`, children: "\u2463 Explainer" })] }) }), _jsxs("div", { className: "chat-container", ref: chatContainerRef, children: [!generation && !isLoading && (_jsxs("div", { style: { textAlign: 'center', marginTop: '40px', color: 'var(--text-tertiary)' }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\u2728" }), _jsx("h3", { children: "AI UI Generator" }), _jsx("p", { children: "Create deterministic, validated UIs with explainable reasoning" })] })), generation && (_jsxs(_Fragment, { children: [_jsx("div", { className: "chat-message user", children: _jsx("div", { className: "message-bubble user", children: generation.userMessage }) }), isLoading ? (_jsx("div", { className: "chat-message", children: _jsx("div", { className: "message-bubble loading", style: { width: '200px' } }) })) : (_jsx("div", { className: "chat-message", children: _jsxs("div", { className: "message-bubble ai", children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsx("strong", { children: "\u2713 Generation Complete" }) }), _jsxs("div", { className: "collapsible", children: [_jsxs("div", { className: "collapsible-header", onClick: () => setExpandedPlan(!expandedPlan), children: [_jsx("span", { children: "\uD83D\uDCCB Execution Plan" }), _jsx("span", { className: `collapsible-toggle ${expandedPlan ? 'open' : ''}`, children: "\u25BC" })] }), expandedPlan && (_jsx("div", { className: "collapsible-body open", children: _jsx("div", { className: "collapsible-content", children: _jsxs("div", { className: "json-output", children: [JSON.stringify(generation.plan, null, 2).substring(0, 200), "..."] }) }) }))] }), generation.explanation && (_jsxs("div", { className: "collapsible", children: [_jsxs("div", { className: "collapsible-header", onClick: () => setExpandedExplanation(!expandedExplanation), children: [_jsx("span", { children: "\uD83D\uDCA1 Reasoning" }), _jsx("span", { className: `collapsible-toggle ${expandedExplanation ? 'open' : ''}`, children: "\u25BC" })] }), expandedExplanation && (_jsx("div", { className: "collapsible-body open", children: _jsx("div", { className: "collapsible-content", children: _jsxs("div", { style: { fontSize: '12px', lineHeight: '1.6' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Layout:" }), " ", generation.explanation.layoutReasoning] }), _jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("strong", { children: "Components:" }), _jsx("ul", { style: { marginLeft: '12px', marginTop: '4px' }, children: Object.entries(generation.explanation.componentSelectionReasoning).slice(0, 3).map(([comp, reason]) => (_jsxs("li", { style: { fontSize: '11px' }, children: [comp, ": ", String(reason)] }, comp))) })] })] }) }) }))] })), _jsxs("div", { style: { marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsxs("span", { className: "metadata-badge", children: ["Components: ", componentCount] }), _jsxs("span", { className: "metadata-badge", children: ["LOC: ", generation.metadata?.linesOfCode || 0] })] })] }) }))] })), _jsx("div", { style: { marginTop: 'auto', paddingTop: '16px' }, children: _jsx(Editor, { onGenerate: handleGenerate, isLoading: isLoading, error: generationError || undefined }) })] })] }), _jsxs("div", { className: "panel-right", children: [_jsxs("div", { className: "panel-tabs", children: [_jsx("button", { className: `tab-button ${activeTab === 'code' ? 'active' : ''}`, onClick: () => setActiveTab('code'), disabled: !generation, children: "\uD83D\uDCBB Code" }), _jsx("button", { className: `tab-button ${activeTab === 'diff' ? 'active' : ''}`, onClick: () => setActiveTab('diff'), disabled: !generation?.diff, children: "\uD83D\uDD04 Diff" }), _jsx("button", { className: `tab-button ${activeTab === 'preview' ? 'active' : ''}`, onClick: () => setActiveTab('preview'), disabled: !generation, children: "\uD83D\uDC41\uFE0F Preview" })] }), _jsx("div", { className: "panel-content", children: !generation ? (_jsx("div", { style: { textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '40px' }, children: _jsx("p", { children: "Generate UI to see code, diff, and preview" }) })) : (_jsxs(_Fragment, { children: [activeTab === 'code' && (_jsx(CodeViewer, { code: generation.generatedCode })), activeTab === 'diff' && generation.diff && (_jsx(DiffViewer, { newCode: generation.generatedCode })), activeTab === 'preview' && (_jsx(Preview, { code: generation.generatedCode, isLoading: isLoading }))] })) })] }), toast && (_jsxs("div", { className: `toast ${toast.type}`, children: [toast.type === 'success' ? '✓' : '✕', " ", toast.message] })), generationError && (_jsx("div", { className: "modal-overlay", onClick: () => { }, children: _jsxs("div", { className: "modal-dialog", children: [_jsx("div", { className: "modal-header", children: _jsx("h3", { className: "modal-title", children: "Validation Error" }) }), _jsx("div", { className: "modal-body", children: _jsx(Alert, { message: generationError, type: "error" }) }), _jsx("div", { className: "modal-footer", children: _jsx(Button, { variant: "primary", onClick: () => { }, children: "Dismiss" }) })] }) })), _jsxs(Modal, { title: "Replay Generations", open: showModal, onClose: () => setShowModal(false), children: [_jsx("p", { style: { marginBottom: '16px', color: 'var(--text-secondary)' }, children: "Watch how the UI evolved through the generation pipeline." }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "secondary", onClick: () => setShowModal(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: () => setShowModal(false), children: "Start Replay" })] })] })] }));
};
export default App;
