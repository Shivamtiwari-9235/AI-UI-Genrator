export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
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
  generate: (message: string, previousVersionId?: string) =>
    apiCall('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ message, previousVersionId })
    }),

  getVersions: (limit: number = 10) =>
    apiCall(`/api/versions?limit=${limit}`),

  getVersion: (id: string) =>
    apiCall(`/api/versions/${id}`),

  rollback: (versionId: string) =>
    apiCall(`/api/rollback/${versionId}`, { method: 'POST' }),

  validatePlan: (plan: any) =>
    apiCall('/api/validate-plan', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),

  analyzeCode: (code: string) =>
    apiCall('/api/analyze-code', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),

  getComponents: () =>
    apiCall('/api/components'),

  getComponentSchema: (name: string) =>
    apiCall(`/api/components/${name}`)
};
