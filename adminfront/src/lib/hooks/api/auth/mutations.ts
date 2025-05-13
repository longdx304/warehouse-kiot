import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LoginCredentials, TokenResponse } from '@/types/auth';
import { setCookie } from '@/actions/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        console.log('Sending login request to API');
        const response = await apiClient.post<TokenResponse>('/api/users/login', credentials);
        console.log('Login API response received');
        return response.data;
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('Login successful, setting tokens');
      
      // Store tokens
      try {
        await setCookie(data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        console.log('Tokens stored successfully');
        
        // Update user data in query client cache
        queryClient.setQueryData(['user'], data.user);
      } catch (error) {
        console.error('Error storing tokens:', error);
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await apiClient.post('/api/users/logout', { refresh_token: refreshToken });
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with cleanup even if API call fails
      }
    },
    onSuccess: async () => {
      console.log('Logging out, clearing tokens');
      // Clear tokens and cache
      localStorage.removeItem('refresh_token');
      await setCookie('');
      queryClient.clear();
    },
  });
};

export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/api/users/logout-all');
      } catch (error) {
        console.error('Logout all error:', error);
        // Continue with cleanup even if API call fails
      }
    },
    onSuccess: async () => {
      console.log('Logging out from all devices, clearing tokens');
      // Clear tokens and cache
      localStorage.removeItem('refresh_token');
      await setCookie('');
      queryClient.clear();
    },
  });
}; 