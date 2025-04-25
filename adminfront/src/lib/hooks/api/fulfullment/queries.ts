import {
	AdminFulfillmentsListRes,
	AdminGetFulfillmentsParams,
	Fulfillment,
} from '@/types/fulfillments';
import generateParams from '@/utils/generate-params';
import { FindParams } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
	UseQueryOptionsWrapper,
} from 'medusa-react';

const ADMIN_FULFILLMENT = `admin-fulfillments` as const;

export const fulfillmentKeys = queryKeysFactory(ADMIN_FULFILLMENT);

type fulfillmentQueryKey = typeof fulfillmentKeys;

export const useAdminFulfillments = (
	/**
	 * Filters and pagination configurations to apply on retrieved currencies.
	 */
	query?: AdminGetFulfillmentsParams,
	options?: UseQueryOptionsWrapper<
		Response<AdminFulfillmentsListRes>,
		Error,
		ReturnType<fulfillmentQueryKey['list']>
	>
) => {
	const { client } = useMedusa();

	const { data, ...rest } = useQuery(
		fulfillmentKeys.list(query),
		() => {
			const params = query && generateParams(query);
			return client.admin.custom.get(`/admin/fulfillment${params}`);
		},
		options
	);
	return { ...data, ...rest } as const;
};

export const useAdminFulfillment = (
	id: string,
	query?: FindParams,
	options?: UseQueryOptionsWrapper<
		Response<{ fulfillment: Fulfillment }>,
		Error,
		ReturnType<fulfillmentQueryKey['detail']>
	>
) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		fulfillmentKeys.detail(id),
		() => client.admin.custom.get(`/admin/fulfillment/${id}`),
		options
	);
	return { ...data, ...rest } as const;
};
