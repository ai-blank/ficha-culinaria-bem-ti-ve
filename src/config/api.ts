// Centralized API configuration
// For development, try different ports or use environment variables
const getApiBaseUrl = () => {
  // Try different common backend ports
  const possiblePorts = [3001, 5000, 8000, 3000];
  
  // For now, use a default that works with most setups
  // Users can modify this based on their backend configuration
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API Base URL configured as:', API_BASE_URL);