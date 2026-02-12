import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Button, Modal } from '../components/library';
import { Editor } from '../components/Editor';
import { Preview } from '../components/Preview';
import { CodeViewer, DiffViewer } from '../components/DiffViewer';
// History components not used in this refactor
import { useGeneration, useVersionHistory } from '../hooks/useGeneration';
import '../styles/index.css';

type TabType = 'code' | 'diff' | 'preview';
type PipelineStep = 'intent' | 'planner' | 'generator' | 'explainer' | 'idle';


export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [showModal, setShowModal] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedPlan, setExpandedPlan] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  
  const { generation, isLoading, error: generationError, generate, clearError } = useGeneration();
  const { versions, fetchVersions } = useVersionHistory();
  const [currentVersionId, setCurrentVersionId] = useState<string>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleGenerate = useCallback(async (message: string) => {
    try {
      setPipelineStep('intent');
      setTimeout(() => setPipelineStep('planner'), 500);
      setTimeout(() => setPipelineStep('generator'), 1000);
      setTimeout(() => setPipelineStep('explainer'), 1500);
      
      await generate(message, currentVersionId);
      
      setPipelineStep('idle');
      setToast({ message: 'Generation complete!', type: 'success' });
    } catch (err) {
      console.error('Generation failed:', err);
      setToast({ message: 'Generation failed', type: 'error' });
      setPipelineStep('idle');
    }
  }, [generate, currentVersionId]);

  const handleSelectVersion = useCallback((versionId: string) => {
    setCurrentVersionId(versionId);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
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

  return (
    <div className="app-container">
      {/* LEFT SIDEBAR */}
      <div className="sidebar-left">
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="app-logo-icon">✨</div>
            <div className="app-logo-text">AI UI Gen</div>
          </div>
          <div className="status-badge success">
            <span>●</span>
            Deterministic Mode
          </div>
        </div>

        <div className="version-list">
          {versions.length === 0 ? (
            <div style={{ padding: '16px 12px', color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center' }}>
              No versions yet
            </div>
          ) : (
            versions.map((v, idx) => (
              <div
                key={v.id}
                className={`version-item ${v.id === currentVersionId ? 'active' : ''}`}
                onClick={() => handleSelectVersion(v.id)}
              >
                <div style={{ fontWeight: 500 }}>v{versions.length - idx}</div>
                <div className="version-item-time">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER PANEL - Chat Interface */}
      <div className="panel-center">
        <div className="chat-header">
          <div className="pipeline-indicator">
            <div className={`pipeline-step ${pipelineStep === 'intent' ? 'active' : ''}`}>
              ① Intent
            </div>
            <div className="pipeline-separator" />
            <div className={`pipeline-step ${pipelineStep === 'planner' ? 'active' : ''}`}>
              ② Planner
            </div>
            <div className="pipeline-separator" />
            <div className={`pipeline-step ${pipelineStep === 'generator' ? 'active' : ''}`}>
              ③ Generator
            </div>
            <div className="pipeline-separator" />
            <div className={`pipeline-step ${pipelineStep === 'explainer' ? 'active' : ''}`}>
              ④ Explainer
            </div>
          </div>
        </div>

        <div className="chat-container" ref={chatContainerRef}>
          {/* Initial State */}
          {!generation && !isLoading && (
            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <h3>AI UI Generator</h3>
              <p>Create deterministic, validated UIs with explainable reasoning</p>
            </div>
          )}

          {/* Chat Messages */}
          {generation && (
            <>
              {/* User Message */}
              <div className="chat-message user">
                <div className="message-bubble user">
                  {generation.userMessage}
                </div>
              </div>

              {/* AI Response */}
              {isLoading ? (
                <div className="chat-message">
                  <div className="message-bubble loading" style={{ width: '200px' }} />
                </div>
              ) : (
                <div className="chat-message">
                  <div className="message-bubble ai">
                    <div style={{ marginBottom: '12px' }}>
                      <strong>✓ Generation Complete</strong>
                    </div>

                    {/* Plan Section */}
                    <div className="collapsible">
                      <div className="collapsible-header" onClick={() => setExpandedPlan(!expandedPlan)}>
                        <span>📋 Execution Plan</span>
                        <span className={`collapsible-toggle ${expandedPlan ? 'open' : ''}`}>▼</span>
                      </div>
                      {expandedPlan && (
                        <div className="collapsible-body open">
                          <div className="collapsible-content">
                            <div className="json-output">
                              {JSON.stringify(generation.plan, null, 2).substring(0, 200)}...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation Section */}
                    {generation.explanation && (
                      <div className="collapsible">
                        <div className="collapsible-header" onClick={() => setExpandedExplanation(!expandedExplanation)}>
                          <span>💡 Reasoning</span>
                          <span className={`collapsible-toggle ${expandedExplanation ? 'open' : ''}`}>▼</span>
                        </div>
                        {expandedExplanation && (
                          <div className="collapsible-body open">
                            <div className="collapsible-content">
                              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                <p><strong>Layout:</strong> {generation.explanation.layoutReasoning}</p>
                                <div style={{ marginTop: '8px' }}>
                                  <strong>Components:</strong>
                                  <ul style={{ marginLeft: '12px', marginTop: '4px' }}>
                                    {Object.entries(generation.explanation.componentSelectionReasoning).slice(0, 3).map(([comp, reason]) => (
                                      <li key={comp} style={{ fontSize: '11px' }}>
                                        {comp}: {String(reason)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="metadata-badge">Components: {componentCount}</span>
                      <span className="metadata-badge">LOC: {generation.metadata?.linesOfCode || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Input Area - Bottom of Chat */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <Editor 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              error={generationError || undefined}
            />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Code/Diff/Preview Tabs */}
      <div className="panel-right">
        <div className="panel-tabs">
          <button 
            className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
            disabled={!generation}
          >
            💻 Code
          </button>
          <button 
            className={`tab-button ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
            disabled={!generation?.diff}
          >
            🔄 Diff
          </button>
          <button 
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            disabled={!generation}
          >
            👁️ Preview
          </button>
        </div>

        <div className="panel-content">
          {!generation ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '40px' }}>
              <p>Generate UI to see code, diff, and preview</p>
            </div>
          ) : (
            <>
              {activeTab === 'code' && (
                <CodeViewer code={generation.generatedCode} />
              )}
              
              {activeTab === 'diff' && generation.diff && (
                <DiffViewer newCode={generation.generatedCode} />
              )}
              
              {activeTab === 'preview' && (
                <Preview code={generation.generatedCode} isLoading={isLoading} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Validation Status Modal */}
      {generationError && (
        <div className="modal-overlay" onClick={clearError}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Validation Error</h3>
            </div>
            <div className="modal-body">
              <Alert message={generationError} type="error" />
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={clearError}>Dismiss</Button>
            </div>
          </div>
        </div>
      )}

      {/* Replay Modal */}
      <Modal title="Replay Generations" open={showModal} onClose={() => setShowModal(false)}>
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Watch how the UI evolved through the generation pipeline.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>Start Replay</Button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
