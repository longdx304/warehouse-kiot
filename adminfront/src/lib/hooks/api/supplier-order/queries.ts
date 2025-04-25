import { SupplierOrderListRes, SupplierOrderRes } from '@/types/supplier';
import generateParams from '@/utils/generate-params';
import { FindParams } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const SUPPLIER_ORDER_LIST = `admin-supplier-order` as const;

export const supplierOrdersKeys = queryKeysFactory(SUPPLIER_ORDER_LIST);

type supplierOrdersQueryKey = typeof supplierOrdersKeys;

export type SupplierOrderQueryKeyParams = {
	q?: string;
	offset?: number;
	limit?: number;
	status?: any;
	fulfillment_status?: any;
};
export const useAdminSupplierOrders = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: SupplierOrderQueryKeyParams,
	options?: UseQueryOptionsWrapper<
		Response<SupplierOrderListRes>,
		Error,
		ReturnType<supplierOrdersQueryKey['list']>
	>
) => {
	const { client } = useMedusa();

	const { data, ...rest } = useQuery(
		supplierOrdersKeys.list(query),
		() => {
			const params = query && generateParams(query);
			return client.admin.custom.get(`/admin/supplier-order${params}`);
		},
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminSupplierOrder = (
	id: string,
	query?: FindParams,
	options?: UseQueryOptionsWrapper<
		Response<SupplierOrderRes>,
		Error,
		ReturnType<supplierOrdersQueryKey['detail']>
	>
) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		supplierOrdersKeys.detail(id),
		() => client.admin.custom.get(`/admin/supplier-order/${id}`),
		options
	);
	return { ...data, ...rest } as const;
};
