import {
	AdminItemUnitDeleteRes,
	AdminItemUnitRes,
	AdminPostItemUnitReq,
} from '@/types/item-unit';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { adminItemUnitKeys } from './queries';

export const useAdminCreateItemUnit = (
	options?: UseMutationOptions<
		Response<AdminItemUnitRes>,
		Error,
		AdminPostItemUnitReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostItemUnitReq) =>
			client.admin.custom.post(`/admin/item-unit`, payload),
		buildOptions(queryClient, [adminItemUnitKeys.lists()], options)
	);
};

export const useAdminUpdateItemUnit = (
	id: string,
	options?: UseMutationOptions<
		Response<AdminItemUnitRes>,
		Error,
		AdminPostItemUnitReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostItemUnitReq) =>
			client.admin.custom.post(`/admin/item-unit/${id}`, payload),
		buildOptions(
			queryClient,
			[adminItemUnitKeys.lists(), adminItemUnitKeys.detail(id)],
			options
		)
	);
};

export const useAdminDeleteItemUnit = (
	id: string,
	options?: UseMutationOptions<Response<AdminItemUnitDeleteRes>, Error, void>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.delete(`/admin/item-unit/${id}`),
		buildOptions(
			queryClient,
			[adminItemUnitKeys.lists(), adminItemUnitKeys.detail(id)],
			options
		)
	);
};
