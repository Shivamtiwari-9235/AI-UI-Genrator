import React from 'react';
import { Card, Stack, Button } from './library';

interface CodeViewerProps {
  code?: string;
  language?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code) {
    return (
      <Card title="Generated Code">
        <div style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          No code generated yet
        </div>
      </Card>
    );
  }

  return (
    <Card title="Generated Code" subtitle={`Language: ${language}`}>
      <Stack direction="vertical" spacing="md">
        <Button
          variant="secondary"
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </Button>

        <div
          style={{
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
          }}
        >
          <pre style={{ margin: 0 }}>
            <code>{code}</code>
          </pre>
        </div>

        <div style={{ fontSize: '12px', color: '#999' }}>
          <p>📋 Code is generated and validated against component schema</p>
          <p>🔒 No inline styles, external libraries, or dangerous patterns allowed</p>
          <p>✅ Safe to use in production after proper integration</p>
        </div>
      </Stack>
    </Card>
  );
};

interface DiffViewerProps {
  oldCode?: string;
  newCode?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode }) => {
  if (!oldCode || !newCode) {
    return (
      <Card title="Diff Viewer">
        <div style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          No comparison available
        </div>
      </Card>
    );
  }

  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  return (
    <Card title="Changes" subtitle="Diff from previous version">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Previous</h4>
          <div
            style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {oldLines.slice(0, 20).join('\n')}
            {oldLines.length > 20 && `\n... and ${oldLines.length - 20} more lines`}
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Current</h4>
          <div
            style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {newLines.slice(0, 20).join('\n')}
            {newLines.length > 20 && `\n... and ${newLines.length - 20} more lines`}
          </div>
        </div>
      </div>
    </Card>
  );
};
