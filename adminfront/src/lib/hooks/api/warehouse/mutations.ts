import {
	AdminInventoryRemoveRes,
	AdminPostInboundInventoryReq,
	AdminPostManageInventoryWarehouseReq,
	AdminPostManageWarehouseVariantReq,
	AdminPostRemmoveInventoryReq,
	AdminPostWarehouseReq,
	AdminPostWarehouseVariantReq,
	AdminWarehouseDeleteRes,
	AdminWarehouseRes,
} from '@/types/warehouse';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { adminWarehouseKeys } from './queries';

export const useAdminCreateWarehouse = (
	options?: UseMutationOptions<
		Response<AdminWarehouseRes>,
		Error,
		AdminPostWarehouseReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostWarehouseReq) =>
			client.admin.custom.post(`/admin/warehouse`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminCreateWarehouseVariant = (
	options?: UseMutationOptions<
		Response<any>,
		Error,
		AdminPostManageWarehouseVariantReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostManageWarehouseVariantReq) =>
			client.admin.custom.post(`/admin/warehouse/manage/variant`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminDeleteWarehouse = (
	options?: UseMutationOptions<Response<AdminWarehouseDeleteRes>, Error, string>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => client.admin.custom.delete(`/admin/warehouse/${id}`),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminCreateInventory = (
	options?: UseMutationOptions<
		Response<AdminWarehouseRes>,
		Error,
		AdminPostInboundInventoryReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostInboundInventoryReq) =>
			client.admin.custom.post(`/admin/warehouse/inbound`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminAddInventoryToWarehouse = (
	options?: UseMutationOptions<
		Response<AdminWarehouseRes>,
		Error,
		AdminPostManageInventoryWarehouseReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostManageInventoryWarehouseReq) =>
			client.admin.custom.post(`/admin/warehouse/manage/add`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminRemoveInventory = (
	options?: UseMutationOptions<
		Response<AdminInventoryRemoveRes>,
		Error,
		AdminPostRemmoveInventoryReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostRemmoveInventoryReq) =>
			client.admin.custom.post(`/admin/warehouse/outbound`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};

export const useAdminRemoveInventoryToWarehouse = (
	options?: UseMutationOptions<
		Response<AdminWarehouseRes>,
		Error,
		AdminPostManageInventoryWarehouseReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostManageInventoryWarehouseReq) =>
			client.admin.custom.post(`/admin/warehouse/manage/remove`, payload),
		buildOptions(queryClient, [adminWarehouseKeys.lists()], options)
	);
};
