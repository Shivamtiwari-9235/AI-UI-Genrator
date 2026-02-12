import { useState, useCallback } from 'react';
import { apiConfig } from '../config/apiConfig';
export function useGeneration() {
    const [generation, setGeneration] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const generate = useCallback(async (message, previousVersionId) => {
        setIsLoading(true);
        setError(null);
        try {
            const url = apiConfig.endpoints.generate;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, previousVersionId }),
                credentials: 'include'
            });
            // Get response text first to debug
            const responseText = await response.text();
            if (!response.ok) {
                let errorMessage = 'Generation failed';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.error || 'Generation failed';
                }
                catch (e) {
                    console.error('Error parsing error response:', e);
                    console.error('Response text:', responseText);
                }
                throw new Error(errorMessage);
            }
            // Parse response JSON
            let data;
            try {
                data = JSON.parse(responseText);
            }
            catch (e) {
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Generation failed';
            setError(errorMessage);
            console.error('Generation error:', err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    return { generation, isLoading, error, generate };
}
export function useVersionHistory() {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchVersions = useCallback(async (limit = 10) => {
        setIsLoading(true);
        try {
            const url = `${apiConfig.endpoints.versions}?limit=${limit}`;
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
            }
            catch (e) {
                console.error('Failed to parse versions JSON:', e);
                console.error('Response text:', responseText);
                setVersions([]);
                return [];
            }
            setVersions(data.data || []);
            return data.data;
        }
        catch (err) {
            console.error('Error fetching versions:', err);
            setVersions([]);
            return [];
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const getVersion = useCallback(async (id) => {
        try {
            const response = await fetch(apiConfig.endpoints.getVersion(id));
            const data = await response.json();
            return data.data;
        }
        catch (err) {
            console.error('Failed to fetch version:', err);
            return null;
        }
    }, []);
    const rollback = useCallback(async (versionId) => {
        try {
            const response = await fetch(apiConfig.endpoints.rollback(versionId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await response.json();
            return data.data;
        }
        catch (err) {
            console.error('Rollback failed:', err);
            throw err;
        }
    }, []);
    return { versions, isLoading, fetchVersions, getVersion, rollback };
}
export function useComponentLibrary() {
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchComponents = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(apiConfig.endpoints.components);
            const data = await response.json();
            setComponents(data.components || []);
            return data.components;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const getComponentSchema = useCallback(async (name) => {
        try {
            const response = await fetch(apiConfig.endpoints.getComponent(name));
            const data = await response.json();
            return data.schema;
        }
        catch (err) {
            console.error('Failed to fetch component schema:', err);
            return null;
        }
    }, []);
    return { components, isLoading, fetchComponents, getComponentSchema };
}
