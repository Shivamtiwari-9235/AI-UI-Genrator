import React, { useEffect } from 'react';
import { Card, Stack, Alert, Button } from './library';

interface PreviewProps {
  code?: string;
  error?: string;
  isLoading?: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ code, error, isLoading }) => {
  const [iframeKey, setIframeKey] = React.useState(0);

  useEffect(() => {
    if (code) {
      // Force iframe refresh
      setIframeKey(k => k + 1);
    }
  }, [code]);

  if (isLoading) {
    return (
      <Card title="Preview">
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Generating preview...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Preview">
        <Alert message={error} type="error" />
      </Card>
    );
  }

  if (!code) {
    return (
      <Card title="Preview" subtitle="Generated UI will appear here">
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No generation yet
        </div>
      </Card>
    );
  }

  return (
    <Card title="Preview" subtitle="Sandboxed component preview">
      <Stack direction="vertical" spacing="md">
        <div style={{ fontSize: '12px', color: '#999' }}>
          ⚠️ This is a static preview. For full interactivity, integrate the generated code into your
          React application.
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
          <iframe
            key={iframeKey}
            srcDoc={generatePreviewHTML()}
            style={{
              width: '100%',
              height: '400px',
              border: 'none',
              background: 'white'
            }}
            title="UI Preview"
            sandbox={{
              allowSameOrigin: true
            } as any}
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated.tsx';
            a.click();
          }}
        >
          Download Code
        </Button>
      </Stack>
    </Card>
  );
};

function generatePreviewHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 24px;
    }
    .preview {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1, h2, h3, h4 { margin-bottom: 16px; }
    .header { border-bottom: 1px solid #eee; margin-bottom: 24px; padding-bottom: 16px; }
    .card { border: 1px solid #ddd; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
    .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn:hover { opacity: 0.9; }
    input, select, textarea { width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; margin: 8px 0; font-family: inherit; }
    label { display: block; font-weight: 500; margin-top: 12px; margin-bottom: 4px; }
    .alert { padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }
    .alert-info { background: #d1ecf1; color: #0c5460; }
    .alert-error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="preview">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">Static Preview (Non-Interactive)</p>
    <!-- Generated components would render here -->
    <div class="card">
      <h3>Component Preview</h3>
      <p>Components are rendered server-side. Import generated code into your React application for full functionality.</p>
    </div>
  </div>
</body>
</html>`;
}
