import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/auth';

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