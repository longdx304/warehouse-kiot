import {
	AdminGetItemUnitParams,
	AdminItemUnitListRes,
} from '@/types/item-unit';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const ADMIN_ITEM_UNIT = `admin_item_unit` as const;

export const adminItemUnitKeys = queryKeysFactory(ADMIN_ITEM_UNIT);

type ItemUnitQueryKey = typeof adminItemUnitKeys;

export const useAdminItemUnits = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: AdminGetItemUnitParams,
	options?: UseQueryOptionsWrapper<
		Response<AdminItemUnitListRes>,
		Error,
		ReturnType<ItemUnitQueryKey['list']>
	>
) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		adminItemUnitKeys.list(query),
		() => client.admin.custom.get('/admin/item-unit'),
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminItemUnit = (id: string) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		adminItemUnitKeys.detail(id),
		() => client.admin.custom.get(`/admin/item-unit/${id}`),
		{
			enabled: !!id,
		}
	);
	return { ...data, ...rest } as const;
};
