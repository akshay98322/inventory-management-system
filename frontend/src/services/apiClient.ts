import axios, { AxiosError, AxiosResponse } from 'axios';
import config from '../config/constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(config.JWT_STORAGE_KEY);
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle different error types
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem(config.JWT_STORAGE_KEY);
      localStorage.removeItem(config.REFRESH_TOKEN_KEY);
      
      // Avoid infinite redirect loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout');
    } else if (!error.response) {
      // Network error
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
