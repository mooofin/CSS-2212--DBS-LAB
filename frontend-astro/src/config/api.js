// Central API configuration
const getApiUrl = () => {
  // Use relative URL for both dev and prod because of Astro's proxy
  return '/api';
};

export const API_BASE_URL = getApiUrl();
