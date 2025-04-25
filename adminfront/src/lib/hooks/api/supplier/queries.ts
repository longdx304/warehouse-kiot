import {
	SupplierListResponse,
	SupplierOrderListRes,
	SupplierOrderRes,
	SupplierResponse,
} from '@/types/supplier';
import generateParams from '@/utils/generate-params';
import { FindParams } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

export const SUPPLIER_LIST = `admin-supplier` as const;

export const supplierKeys = queryKeysFactory(SUPPLIER_LIST);

type supplierQueryKey = typeof supplierKeys;

export type SupplierQueryKeyParams = {
	q?: string;
	offset?: number;
	limit?: number;
};
export const useAdminSuppliers = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: SupplierQueryKeyParams,
	options?: UseQueryOptionsWrapper<
		Response<SupplierListResponse>,
		Error,
		ReturnType<supplierQueryKey['list']>
	>
) => {
	const { client } = useMedusa();

	const { data, ...rest } = useQuery(
		supplierKeys.list(query),
		() => {
			const params = query && generateParams(query);
			return client.admin.custom.get(`/admin/supplier${params}`);
		},
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminSupplier = (
	id: string,
	query?: FindParams,
	options?: UseQueryOptionsWrapper<
		Response<SupplierResponse>,
		Error,
		ReturnType<supplierQueryKey['detail']>
	>
) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		supplierKeys.detail(id),
		() => client.admin.custom.get(`/admin/supplier/${id}`),
		options
	);
	return { ...data, ...rest } as const;
};
