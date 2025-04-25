import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { queryKeysFactory, useMedusa } from 'medusa-react';

const ADMIN_INVENTORY = `admin_inventory` as const;

export const adminInventoryKeys = queryKeysFactory(ADMIN_INVENTORY);

export const useCheckInventory = (
	options?: UseMutationOptions<
		Response<{ fileKey: string; fileSize: number; downloadUrl: string }>,
		Error,
		{ filterable_fields?: Record<string, any> }
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: { filterable_fields?: Record<string, any> }) =>
			client.admin.custom.post(`/admin/product/inventory`, payload),
		buildOptions(queryClient, [adminInventoryKeys.lists()], options)
	);
};
