import React from 'react';
import { Card, Stack, Button } from './library';

export interface VersionInfo {
  id: string;
  timestamp: number;
  userMessage: string;
  metadata: {
    intent: string;
    componentCount: number;
    linesOfCode: number;
  };
}


export const VersionHistory: React.FC<{
  versions: VersionInfo[];
  currentVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onReplay?: () => void;
}> = ({ versions, currentVersionId, onSelectVersion, onReplay }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (versions.length === 0) {
    return (
      <Card title="Version History">
        <div style={{ color: '#999', textAlign: 'center', padding: '24px' }}>
          No versions yet. Generate a UI to start.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Version History" subtitle={`${versions.length} versions saved`}>
      <Stack direction="vertical" spacing="md">
        {onReplay && (
          <Button variant="secondary" onClick={onReplay}>
            ▶️ Replay All Generations
          </Button>
        )}

        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
          {versions.map((version, idx) => (
            <div
              key={version.id}
              style={{
                padding: '12px',
                border: currentVersionId === version.id ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '8px',
                cursor: 'pointer',
                background: currentVersionId === version.id ? '#f0f7ff' : 'white',
                transition: 'all 0.2s'
              }}
              onClick={() => onSelectVersion?.(version.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>v{versions.length - idx}</strong>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {formatDate(version.timestamp)}
                </span>
              </div>

              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                {version.userMessage.substring(0, 60)}
                {version.userMessage.length > 60 ? '...' : ''}
              </p>

              <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '16px' }}>
                <span>Intent: {version.metadata.intent}</span>
                <span>{version.metadata.componentCount} components</span>
                <span>{version.metadata.linesOfCode} LOC</span>
              </div>
            </div>
          ))}
        </div>
      </Stack>
    </Card>
  );
};

interface ExplanationProps {
  explanation?: {
    layoutReasoning: string;
    componentSelectionReasoning: Record<string, string>;
    modificationReasoning?: string;
    tradeoffs: string[];
    constraints: string[];
  };
}

export const Explanation: React.FC<ExplanationProps> = ({ explanation }) => {
  if (!explanation) {
    return (
      <Card title="Generation Explanation">
        <div style={{ color: '#999', textAlign: 'center', padding: '24px' }}>
          No explanation available
        </div>
      </Card>
    );
  }

  return (
    <Card title="Generation Explanation">
      <Stack direction="vertical" spacing="md">
        <div>
          <h4 style={{ marginBottom: '8px' }}>Layout Reasoning</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>{explanation.layoutReasoning}</p>
        </div>

        <div>
          <h4 style={{ marginBottom: '8px' }}>Component Selection</h4>
          <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
            {Object.entries(explanation.componentSelectionReasoning).map(([comp, reason]) => (
              <li key={comp} style={{ marginBottom: '8px' }}>
                <strong>{comp}:</strong> {reason}
              </li>
            ))}
          </ul>
        </div>

        {explanation.modificationReasoning && (
          <div>
            <h4 style={{ marginBottom: '8px' }}>Modifications</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>{explanation.modificationReasoning}</p>
          </div>
        )}

        <div>
          <h4 style={{ marginBottom: '8px' }}>Tradeoffs</h4>
          <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
            {explanation.tradeoffs.map((tradeoff, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '8px' }}>Constraints</h4>
          <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
            {explanation.constraints.map((constraint, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      </Stack>
    </Card>
  );
};
