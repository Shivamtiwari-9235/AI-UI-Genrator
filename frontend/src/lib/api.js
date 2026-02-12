export async function apiCall(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API call failed');
    }
    return response.json();
}
export const api = {
    generate: (message, previousVersionId) => apiCall('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ message, previousVersionId })
    }),
    getVersions: (limit = 10) => apiCall(`/api/versions?limit=${limit}`),
    getVersion: (id) => apiCall(`/api/versions/${id}`),
    rollback: (versionId) => apiCall(`/api/rollback/${versionId}`, { method: 'POST' }),
    validatePlan: (plan) => apiCall('/api/validate-plan', {
        method: 'POST',
        body: JSON.stringify(plan)
    }),
    analyzeCode: (code) => apiCall('/api/analyze-code', {
        method: 'POST',
        body: JSON.stringify({ code })
    }),
    getComponents: () => apiCall('/api/components'),
    getComponentSchema: (name) => apiCall(`/api/components/${name}`)
};
