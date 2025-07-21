// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://13.60.241.86:5000',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'VeriNews',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'AI-powered news verification and fact-checking application',
  
  // Feature Flags
  enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // API Endpoints
  endpoints: {
    verifyClaim: '/api/claims/verify',
    analyzeArticles: '/api/analysis/analyze',
    getClaims: '/public/claims',
    getClaimsByCategory: '/public/claims/by-category',
    getSources: '/public/sources',
    getAnalyses: '/public/analyses',
    exportCSV: '/api/export',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${config.apiBaseUrl}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Helper function to get endpoint URL
export const getEndpointUrl = (endpointKey: keyof typeof config.endpoints): string => {
  return `${config.apiBaseUrl}${config.endpoints[endpointKey]}`;
}; 

export async function verifyClaim(claimText: string) {
  const url = getEndpointUrl('verifyClaim');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ claim: claimText }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify claim');
  }

  return response.json();
} 