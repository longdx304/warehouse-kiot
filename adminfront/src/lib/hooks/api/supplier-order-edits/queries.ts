import generateParams from '@/utils/generate-params';
import { FindParams } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const SUPPLIER_ORDER_EDITS_LIST = `admin-supplier-order-edits` as const;

export const supplierOrderEditsKeys = queryKeysFactory(
	SUPPLIER_ORDER_EDITS_LIST
);

type supplierOrderEditsQueryKey = typeof supplierOrderEditsKeys;

export type SupplierOrderEditsQueryKeyParams = {
	q?: string;
	offset?: number;
	limit?: number;
	supplier_order_id?: string;
};
export const useAdminSupplierOrderEdits = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: SupplierOrderEditsQueryKeyParams,
	options?: UseQueryOptionsWrapper<
		Response<any>,
		Error,
		ReturnType<supplierOrderEditsQueryKey['list']>
	>
) => {
	const { client } = useMedusa();

	const { data, ...rest } = useQuery(
		supplierOrderEditsKeys.list(query),
		() => {
			const params = query && generateParams(query);
			return client.admin.custom.get(`/admin/supplier-order-edits${params}`);
		},
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminSupplierOrderEdit = (
	id: string,
	query?: FindParams,
	options?: UseQueryOptionsWrapper<
		Response<any>,
		Error,
		ReturnType<supplierOrderEditsQueryKey['detail']>
	>
) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		supplierOrderEditsKeys.detail(id),
		() => client.admin.custom.get(`/admin/supplier-order/${id}`),
		options
	);
	return { ...data, ...rest } as const;
};
