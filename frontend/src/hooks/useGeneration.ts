import { useState, useCallback } from 'react';

// Resolve API base URL: prefer Vite env, fall back to localhost in dev.
// Normalize values like ":5000" -> "http://localhost:5000" so browser fetches succeed.
const RAW_API_BASE = ((import.meta as any)?.env?.VITE_API_BASE) || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

function normalizeApiBase(raw: string) {
  if (!raw) return '';
  // If value like :5000, assume localhost
  if (/^:\d+/.test(raw)) return `http://localhost${raw}`;
  // If starts with number+colon (e.g. 127.0.0.1:5000), ensure protocol
  if (/^\d+\.\d+\.\d+\.\d+:\d+/.test(raw) || /^localhost:\d+/.test(raw)) return `http://${raw}`;
  // If already absolute http(s)
  if (/^https?:\/\//.test(raw)) return raw.replace(/\/$/, '');
  // Otherwise return as-is (could be empty or relative)
  return raw.replace(/\/$/, '');
}

const API_BASE = normalizeApiBase(RAW_API_BASE);
export function useGeneration() {
  const [generation, setGeneration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (message: string, previousVersionId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = API_BASE ? `${API_BASE}/api/generate` : `/api/generate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, previousVersionId })
      });

      // Get response text first to debug
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Generation failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = (errorData as any).message || (errorData as any).error || 'Generation failed';
        } catch (e) {
          console.error('Error parsing error response:', e);
          console.error('Response text:', responseText);
        }
        throw new Error(errorMessage);
      }

      // Parse response JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (!data || !data.data) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure');
      }

      setGeneration(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      console.error('Generation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generation, isLoading, error, generate };
}

export function useVersionHistory() {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = useCallback(async (limit: number = 10) => {
    setIsLoading(true);
    try {
      const url = API_BASE ? `${API_BASE}/api/versions?limit=${limit}` : `/api/versions?limit=${limit}`;
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Failed to fetch versions:', responseText);
        setVersions([]);
        return [];
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse versions JSON:', e);
        console.error('Response text:', responseText);
        setVersions([]);
        return [];
      }

      setVersions(data.data || []);
      return data.data;
    } catch (err) {
      console.error('Error fetching versions:', err);
      setVersions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVersion = useCallback(async (id: string) => {
    try {
      const response = await fetch(API_BASE ? `${API_BASE}/api/versions/${id}` : `/api/versions/${id}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Failed to fetch version:', err);
      return null;
    }
  }, []);

  const rollback = useCallback(async (versionId: string) => {
    try {
      const response = await fetch(API_BASE ? `${API_BASE}/api/rollback/${versionId}` : `/api/rollback/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Rollback failed:', err);
      throw err;
    }
  }, []);

  return { versions, isLoading, fetchVersions, getVersion, rollback };
}

export function useComponentLibrary() {
  const [components, setComponents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE ? `${API_BASE}/api/components` : `/api/components`);
      const data = await response.json();
      setComponents(data.components || []);
      return data.components;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getComponentSchema = useCallback(async (name: string) => {
    try {
      const response = await fetch(API_BASE ? `${API_BASE}/api/components/${name}` : `/api/components/${name}`);
      const data = await response.json();
      return data.schema;
    } catch (err) {
      console.error('Failed to fetch component schema:', err);
      return null;
    }
  }, []);

  return { components, isLoading, fetchComponents, getComponentSchema };
}
