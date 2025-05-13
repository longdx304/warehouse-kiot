import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface OrderListParams {
  skip?: number;
  limit?: number;
  order_status?: number;
  code?: string;
  customer_name?: string;
  handler_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface LineItem {
  id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  warehouse_inventory?: number;
}

export interface Order {
  id: string;
  code: string;
  customer_name?: string;
  status: number;
  status_value?: string;
  handler_id?: string;
  handler_at?: string;
  items: LineItem[];
  created_at: string;
  updated_at: string;
}

interface OrderListResponse {
  data: Order[];
  total: number;
  skip: number;
  limit: number;
}

export const useGetStockOut = () => {
  return useQuery({
    queryKey: ['stock-out'],
    queryFn: async () => {
      const response = await apiClient.get('/api/stock-out');
      return response.data;
    },
  });
};

export const useListOrders = (params: OrderListParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await apiClient.get<OrderListResponse>('/api/orders', { params });
      return response.data;
    },
  });
};

export const useGetOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId, // Only run query if orderId is provided
  });
};



