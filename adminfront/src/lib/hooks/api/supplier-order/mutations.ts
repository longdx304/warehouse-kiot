import { MarkAsFulfilledReq, MarkAsFulfilledRes } from '@/types/supplier';
import {
	CreateSupplierOrderDocument,
	CreateSupplierOrderInput,
	DeleteSupplierOrderLineItem,
	UpdateSupplierOrder,
} from '@/types/supplier-order';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { supplierOrdersKeys } from './queries';

export type AdminPostDocumentReq = {
	id: string;
	document_url: string[];
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
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useCreateDocument = (
	options?: UseMutationOptions<Response<void>, Error, AdminPostDocumentReq>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostDocumentReq) =>
			client.admin.custom.post(`/admin/supplier-order/document`, payload),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.details()],
			options
		)
	);
};
export const useAdminCreateSupplierOrders = (
	options?: UseMutationOptions<Response<void>, Error, CreateSupplierOrderInput>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: CreateSupplierOrderInput) =>
			client.admin.custom.post(`/admin/supplier-order`, payload),
		buildOptions(queryClient, [supplierOrdersKeys.lists()], options)
	);
};

export const useAdminUpdateSupplierOrder = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, UpdateSupplierOrder>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: UpdateSupplierOrder) =>
			client.admin.custom.post(`/admin/supplier-order/${id}`, payload),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminSupplierOrderDeleteLineItem = (
	id: string,
	options?: UseMutationOptions<
		Response<void>,
		Error,
		DeleteSupplierOrderLineItem
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: DeleteSupplierOrderLineItem) =>
			client.admin.custom.post(`/admin/supplier-order/${id}`, payload),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminSupplierOrderCreateDocument = (
	id: string,
	options?: UseMutationOptions<
		Response<void>,
		Error,
		CreateSupplierOrderDocument
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: CreateSupplierOrderDocument) =>
			client.admin.custom.post(`/admin/supplier-order/${id}/document`, payload),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminSupplierOrderDeleteDocument = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, string>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(documentId: string) =>
			client.admin.custom.delete(
				`/admin/supplier-order/${id}/document/${documentId}`
			),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminCancelSupplierOrder = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, void>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/supplier-order/${id}/cancel`),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminSupplierOrderCapturePayment = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, void>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		() => client.admin.custom.post(`/admin/supplier-order/${id}/capture`),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};

export const useAdminSupplierOrderRefundPayment = (
	id: string,
	options?: UseMutationOptions<Response<void>, Error, any>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: any) =>
			client.admin.custom.post(`/admin/supplier-order/${id}/refund`, payload),
		buildOptions(
			queryClient,
			[supplierOrdersKeys.lists(), supplierOrdersKeys.detail(id)],
			options
		)
	);
};
