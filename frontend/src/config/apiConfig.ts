/**
 * Centralized API Configuration
 * Supports development (localhost) and production (Render backend)
 */

export type ApiConfig = {
  baseUrl: string;
  endpoints: {
    generate: string;
    versions: string;
    getVersion: (id: string) => string;
    rollback: (id: string) => string;
    components: string;
    getComponent: (name: string) => string;
  };
};

function getApiBaseUrl(): string {
  // Priority: Vite env → browser origin detection → fallback to localhost
  const viteBase = (import.meta as any)?.env?.VITE_API_BASE;
  
  if (viteBase) {
    return normalizeUrl(viteBase);
  }

  // Production: detect from browser origin
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Vercel deployment: hostname = ai-ui-genrator.vercel.app
    // Point to Render backend
    if (hostname.includes('vercel.app')) {
      return 'https://ai-ui-genrator-1.onrender.com';
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:5000`;
    }
  }

  // Safe fallback
  return 'https://ai-ui-genrator-1.onrender.com';
}

function normalizeUrl(raw: string): string {
  if (!raw) return '';
  // If value like :5000, assume localhost
  if (/^:\d+/.test(raw)) return `http://localhost${raw}`;
  // If starts with number+colon (e.g. 127.0.0.1:5000), ensure protocol
  if (/^\d+\.\d+\.\d+\.\d+:\d+/.test(raw) || /^localhost:\d+/.test(raw)) {
    return `http://${raw}`;
  }
  // If already absolute http(s)
  if (/^https?:\/\//.test(raw)) return raw.replace(/\/$/, '');
  // Otherwise return as-is
  return raw.replace(/\/$/, '');
}

const API_BASE_URL = getApiBaseUrl();

export const apiConfig: ApiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    generate: `${API_BASE_URL}/api/generate`,
    versions: `${API_BASE_URL}/api/versions`,
    getVersion: (id: string) => `${API_BASE_URL}/api/versions/${id}`,
    rollback: (id: string) => `${API_BASE_URL}/api/rollback/${id}`,
    components: `${API_BASE_URL}/api/components`,
    getComponent: (name: string) => `${API_BASE_URL}/api/components/${name}`,
  },
};

export default apiConfig;
