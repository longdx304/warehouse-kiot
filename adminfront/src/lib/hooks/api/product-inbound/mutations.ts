import { SupplierOrder } from '@/types/supplier';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { adminProductInboundKeys } from './queries';
import { AdminPostWarehouseVariantReq1 } from '@/types/warehouse';

export const useAdminProductInboundHandler = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.post(`/admin/product-inbound/${id}/handler`),
		buildOptions(queryClient, [adminProductInboundKeys.lists(), adminProductInboundKeys.details()], options)
	);
};

export const useAdminProductInboundRemoveHandler = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.delete(`/admin/product-inbound/${id}/handler`),
		buildOptions(queryClient, [adminProductInboundKeys.lists(), adminProductInboundKeys.details()], options)
	);
};

type AdminProductInboundConfirmRes = {
	supplierOrder: SupplierOrder;
	message: string;
};

export const useAdminProductInboundConfirmById = (
	id: string,
	options?: UseMutationOptions<
		Response<AdminProductInboundConfirmRes>,
		Error,
		void
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/product-inbound/${id}/confirm`),
		buildOptions(
			queryClient,
			[adminProductInboundKeys.lists(), adminProductInboundKeys.detail(id)],
			options
		)
	);
};

export const useAdminCreateWarehouseAndInventory = (
	options?: UseMutationOptions<
		Response<any>,
		Error,
		AdminPostWarehouseVariantReq1
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostWarehouseVariantReq1) =>
			client.admin.custom.post(`/admin/product-inbound`, payload),
		buildOptions(queryClient, [adminProductInboundKeys.lists()], options)
	);
};
