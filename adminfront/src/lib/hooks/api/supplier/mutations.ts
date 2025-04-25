import {
	AdminItemUnitDeleteRes,
	AdminItemUnitRes,
	AdminPostItemUnitReq,
} from '@/types/item-unit';
import {
	CreateSupplierInput,
	SupplierResponse,
	UpdateSupplierInput,
} from '@/types/supplier';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { supplierKeys } from './queries';

export const useAdminCreateSupplier = (
	options?: UseMutationOptions<
		Response<SupplierResponse>,
		Error,
		CreateSupplierInput
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: CreateSupplierInput) =>
			client.admin.custom.post(`/admin/supplier`, payload),
		buildOptions(queryClient, [supplierKeys.lists()], options)
	);
};

export const useAdminUpdateSupplier = (
	id: string,
	options?: UseMutationOptions<
		Response<SupplierResponse>,
		Error,
		UpdateSupplierInput
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: UpdateSupplierInput) =>
			client.admin.custom.post(`/admin/supplier/${id}`, payload),
		buildOptions(
			queryClient,
			[supplierKeys.lists(), supplierKeys.detail(id)],
			options
		)
	);
};

export const useAdminDeleteSupplier = (
	// id: string,
	options?: UseMutationOptions<Response<any>, Error, string>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => client.admin.custom.delete(`/admin/supplier/${id}`),
		buildOptions(
			queryClient,
			[
				supplierKeys.lists(),
				queryClient.invalidateQueries([supplierKeys, 'detail']),
			],
			options
		)
	);
};
