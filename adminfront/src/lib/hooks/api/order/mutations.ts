import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Assign/Unassign Types
interface AssignOrderRequest {
  order_id: number;
  user_id: string;
}

interface UnassignOrderRequest {
  order_id: number;
}

interface OrderActionResponse {
  success: boolean;
  message: string;
  kiotviet_id?: number;
  code?: string;
}

// Inventory Management Types
interface OrderInventoryRequest {
  warehouse_id: string;
  line_item_id: string;
  sku: string;
  unit_id: string;
  quantity: number;
  type?: 'INBOUND' | 'OUTBOUND';
  reset_inventory?: boolean;
}

interface OrderInventoryResponse {
  success: boolean;
  message: string;
  inventory_quantity: number;
  warehouse_quantity: number;
}

interface OrderInventoryRemoveRequest {
  warehouse_id: string;
  sku: string;
  unit_id: string;
  quantity: number;
}

interface UpdateLineItemWarehouseInventoryRequest {
  warehouse_inventory: number;
}

// Assign/Unassign Mutations
export const useAssignOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignOrderRequest) => {
      const response = await apiClient.post<OrderActionResponse>('/api/stock-out/assign', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-out'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUnassignOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UnassignOrderRequest) => {
      const response = await apiClient.post<OrderActionResponse>('/api/stock-out/unassign', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-out'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Inventory Management Mutations
export const useCreateOrderInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderInventoryRequest) => {
      const response = await apiClient.post<OrderInventoryResponse>('/api/orders/inventory', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRemoveOrderInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderInventoryRemoveRequest) => {
      const response = await apiClient.post<OrderInventoryResponse>('/api/orders/inventory/remove', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateLineItemWarehouseInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lineItemId, data }: { lineItemId: string; data: UpdateLineItemWarehouseInventoryRequest }) => {
      const response = await apiClient.patch<OrderInventoryResponse>(
        `/api/orders/line-items/${lineItemId}/warehouse-inventory`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
