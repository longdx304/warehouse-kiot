import { MarkAsFulfilledReq, MarkAsFulfilledRes } from '@/types/supplier';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { supplierOrderEditsKeys } from './queries';
import { supplierOrdersKeys } from '../supplier-order/queries';

export type AdminPostDocumentReq = {
	id: string;
	document_url: string[];
};

export type CreateOrderEditParams = {
	supplier_order_id: string;
};
export const useMarkAsFulfilledMutation = (
	id: string,
	options?:
		| UseMutationOptions<MarkAsFulfilledRes, Error, MarkAsFulfilledReq, unknown>
		| undefined
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(status: MarkAsFulfilledReq) =>
			client.admin.custom.post(
				`/admin/supplier-order/${id}/fulfillment`,
				status
			),
		buildOptions(
			queryClient,
			[supplierOrderEditsKeys.lists(), supplierOrderEditsKeys.detail(id)],
			options
		)
	);
};

export const useAdminCreateSupplierOrderEdit = (
	options?: UseMutationOptions<Response<any>, Error, CreateOrderEditParams>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: CreateOrderEditParams) =>
			client.admin.custom.post(`/admin/supplier-order-edits`, payload),
		buildOptions(
			queryClient,
			[supplierOrderEditsKeys.lists(), supplierOrdersKeys.details()],
			options
		)
	);
};

export const useAdminUpdateSupplierOrderEdit = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: any) =>
			client.admin.custom.post(`/admin/supplier-order-edits/${id}`, payload),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminDeleteSupplierOrderEdit = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.delete(`/admin/supplier-order-edits/${id}`),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminCancelSupplierOrderEdit = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/supplier-order-edits/${id}/cancel`),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminConfirmSupplierOrderEdit = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/supplier-order-edits/${id}/confirm`),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminSupplierOrderEditAddLineItem = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: any) =>
			client.admin.custom.post(
				`/admin/supplier-order-edits/${id}/items`,
				payload
			),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminSupplierOrderEditUpdateLineItem = (
	id: string,
	lineItemId: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: any) =>
			client.admin.custom.post(
				`/admin/supplier-order-edits/${id}/items/${lineItemId}`,
				payload
			),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminSupplierOrderEditDeleteLineItem = (
	id: string,
	lineItemId: string,
	options?: UseMutationOptions<Response<any>, Error, void>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() =>
			client.admin.custom.delete(
				`/admin/supplier-order-edits/${id}/items/${lineItemId}`
			),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminRequestSOrderEditConfirmation = (
	id: string,
	options?: UseMutationOptions<Response<any>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/supplier-order-edits/${id}/request`),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};

export const useAdminDeleteSOrderEditItemChange = (
	id: string,
	itemChangeId: string,
	options?: UseMutationOptions<Response<any>, Error, void>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() =>
			client.admin.custom.delete(
				`/admin/supplier-order-edits/${id}/changes/${itemChangeId}`
			),
		buildOptions(
			queryClient,
			[
				supplierOrderEditsKeys.lists(),
				supplierOrderEditsKeys.detail(id),
				supplierOrdersKeys.details(),
			],
			options
		)
	);
};
