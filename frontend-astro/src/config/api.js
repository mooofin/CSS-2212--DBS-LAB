// Central API configuration
const getApiUrl = () => {
  // In Astro build, we want to use relative URLs since the API is served from the same origin
  if (import.meta.env.PROD) {
    return '/api';
  }
  // In development, use the dev server URL
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiUrl();
