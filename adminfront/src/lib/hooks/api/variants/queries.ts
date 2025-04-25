import { AdminVariantListRes } from '@/types/variants';
import generateParams from '@/utils/generate-params';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const ADMIN_VARIANTS = `admin_variants` as const;

export const adminVariantKeys = queryKeysFactory(ADMIN_VARIANTS);

type VariantQueryKey = typeof adminVariantKeys;

export const useAdminVariantsSku = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: Record<string, unknown>,
	options?: UseQueryOptionsWrapper<
		Response<AdminVariantListRes>,
		Error,
		ReturnType<VariantQueryKey['list']>
	>
) => {
	const { client } = useMedusa();
	const params = query && generateParams(query);
	const { data, ...rest } = useQuery(
		adminVariantKeys.list(query),
		() => client.admin.custom.get(`/admin/variants/sku${params}`),
		options
	);
	return { ...data, ...rest } as const;
};
