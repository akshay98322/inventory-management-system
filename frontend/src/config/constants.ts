// Environment configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  JWT_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
} as const;

export default config;