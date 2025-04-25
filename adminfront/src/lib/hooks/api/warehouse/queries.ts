import {
	AdminWarehousesListRes,
	AdminWarehouseTransactionsRes,
} from '@/types/warehouse';
import generateParams from '@/utils/generate-params';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const ADMIN_WAREHOUSE = `admin_warehouse` as const;

export const adminWarehouseKeys = queryKeysFactory(ADMIN_WAREHOUSE);

type WarehouseQueryKey = typeof adminWarehouseKeys;

export const useAdminWarehouses = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: Record<string, unknown>,
	options?: UseQueryOptionsWrapper<
		Response<AdminWarehousesListRes>,
		Error,
		ReturnType<WarehouseQueryKey['list']>
	>
) => {
	const { client } = useMedusa();
	const params = query && generateParams(query);
	const { data, ...rest } = useQuery(
		adminWarehouseKeys.list(query),
		() => client.admin.custom.get(`/admin/warehouse${params}`),
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminWarehousesInventoryVariant = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: Record<string, unknown>,
	options?: UseQueryOptionsWrapper<
		Response<any>,
		Error,
		ReturnType<WarehouseQueryKey['list']>
	>
) => {
	const { client } = useMedusa();
	const params = query && generateParams(query);
	const { data, ...rest } = useQuery(
		adminWarehouseKeys.list(query),
		() => client.admin.custom.get(`/admin/warehouse/manage/inventory-variants${params}`),
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminWarehouse = (id: string) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		adminWarehouseKeys.detail(id),
		() => client.admin.custom.get(`/admin/warehouse/${id}`),
		{
			enabled: !!id,
		}
	);
	return { ...data, ...rest } as const;
};

export const useAdminWarehouseInventoryByVariant = (variantId: string) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		adminWarehouseKeys.detail(variantId),
		() => client.admin.custom.get(`/admin/warehouse/variant/${variantId}`),
		{
			enabled: !!variantId,
		}
	);
	return { ...data, ...rest } as const;
};

export const useAdminWarehouseTransactions = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: Record<string, unknown>,
	options?: UseQueryOptionsWrapper<
		Response<AdminWarehouseTransactionsRes>,
		Error,
		ReturnType<WarehouseQueryKey['list']>
	>
) => {
	const { client } = useMedusa();
	const params = query && generateParams(query);

	const { data, ...rest } = useQuery(
		adminWarehouseKeys.list(query),
		() => client.admin.custom.get(`/admin/warehouse/transaction${params}`),
		options
	);
	return { ...data, ...rest } as const;
};
