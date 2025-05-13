import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LoginCredentials, TokenResponse, User } from '@/types/auth';
import { setCookie, deleteCookie } from '@/actions/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<TokenResponse>('/api/users/login', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      // Store tokens
      await setCookie(data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Update user data in query client cache
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

export const useSession = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/api/users/me');
      return response.data;
    },
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/api/users/logout', { refresh_token: refreshToken });
      }
    },
    onSuccess: async () => {
      // Clear tokens and cache
      localStorage.removeItem('refresh_token');
      await deleteCookie();
      queryClient.clear();
    },
  });
}; 