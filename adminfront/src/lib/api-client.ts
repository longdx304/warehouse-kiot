import axios from 'axios';
import { getCookie, setCookie } from '@/actions/auth';
import { TokenResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('API URL:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getCookie();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth header to request');
      } else {
        console.log('No auth token available for request');
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response status:', response.status);
    return response;
  },
  async (error) => {
    console.error('API response error:', error.message, error.response?.status);
    
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log('No refresh token available');
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        console.log('Calling refresh token endpoint');
        const response = await apiClient.post<TokenResponse>('/api/users/refresh-token', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        console.log('Token refresh successful');
        
        // Update tokens
        await setCookie(access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Retry original request
        console.log('Retrying original request');
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 