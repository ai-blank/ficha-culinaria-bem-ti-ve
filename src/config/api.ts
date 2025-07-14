// Centralized API configuration
// Backend server is running on port 5000 as configured in server/.env
const getApiBaseUrl = () => {
  // Backend is configured to run on port 5000
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API conectando na porta 5000 (conforme server/.env):', API_BASE_URL);