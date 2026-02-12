import React, { useState } from 'react';
import { Button, Card, Stack, Alert, TextArea } from './library';

interface EditorProps {
  onGenerate: (message: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const Editor: React.FC<EditorProps> = ({ onGenerate, isLoading, error }) => {
  const [message, setMessage] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('auto');

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

  return (
    <Card title="UI Generator" subtitle="Deterministic AI-powered generation">
      <Stack direction="vertical" spacing="md">
        {error && <Alert message={error} type="error" />}

        <div>
          <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
            Your Request
          </label>
          <TextArea
            placeholder="Describe the UI you want to generate..."
            rows={4}
            value={message}
            onChange={setMessage}
          />
        </div>

        <div>
          <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
            Intent (Optional)
          </label>
          <select
            value={selectedIntent}
            onChange={e => setSelectedIntent(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
          >
            <option value="auto">Auto-Detect</option>
            <option value="create">Create New</option>
            <option value="modify">Modify Existing</option>
            <option value="regenerate">Regenerate</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
            Example Prompts
          </label>
          <Stack direction="vertical" spacing="sm">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setMessage(prompt)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px'
                }}
              >
                {prompt}
              </button>
            ))}
          </Stack>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={handleGenerate}
          disabled={!message.trim() || isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate UI'}
        </Button>
      </Stack>
    </Card>
  );
};
