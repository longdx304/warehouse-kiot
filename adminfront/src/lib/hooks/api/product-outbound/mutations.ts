import { Order } from '@/types/order';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { adminProductOutboundKeys } from './queries';

export const useAdminProductOutboundHandler = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.post(`/admin/product-outbound/${id}/handler`),
		buildOptions(
			queryClient,
			[adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()],
			options
		)
	);
};

export const useAdminUpdateProductOutbound = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, Partial<Order>>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation((data: Partial<Order>) => {
		return client.admin.custom.post(`/admin/product-outbound/${id}`, data);
	}, buildOptions(queryClient, [adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()]));
};


export const useAdminProductOutboundCheck = (
	options?:
		| UseMutationOptions<void, Error, { id: string; itemId: string[], checked: boolean }, unknown>
		| undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id, itemId, checked }: { id: string; itemId: string[]; checked: boolean }) =>
			client.admin.custom.post(`/admin/product-outbound/${id}/check`, {
				itemId,
				checked,
			}),
		buildOptions(
			queryClient,
			[adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()],
			options
		)
	);
};

export const useAdminProductOutboundRemoveHandler = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.delete(`/admin/product-outbound/${id}/handler`),
		buildOptions(
			queryClient,
			[adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()],
			options
		)
	);
};

export const useAdminStockAssignChecker = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.post(`/admin/checker-stock/${id}/handler`),
		buildOptions(
			queryClient,
			[adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()],
			options
		)
	);
};

export const useAdminStockRemoveChecker = (
	options?: UseMutationOptions<void, Error, { id: string }, unknown> | undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		({ id }: { id: string }) =>
			client.admin.custom.delete(`/admin/checker-stock/${id}/handler`),
		buildOptions(
			queryClient,
			[adminProductOutboundKeys.lists(), adminProductOutboundKeys.details()],
			options
		)
	);
};

