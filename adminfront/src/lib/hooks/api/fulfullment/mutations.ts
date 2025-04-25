import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';
import { fulfillmentKeys } from './queries';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	AdminAssignShipment,
	AdminUpdateFulfillment,
	Fulfillment,
} from '@/types/fulfillments';

export const useAdminUpdateFulfillment = (
	id: string,
	options?: UseMutationOptions<
		Response<{ fulfillment: Fulfillment }>,
		Error,
		AdminUpdateFulfillment
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminUpdateFulfillment) =>
			client.admin.custom.post(`/admin/fulfillment/${id}`, payload),
		buildOptions(
			queryClient,
			[fulfillmentKeys.detail(id), fulfillmentKeys.lists()],
			options
		)
	);
};

export const useAdminAssignShipment = (
	options?: UseMutationOptions<
		Response<{ fulfillment: Fulfillment }>,
		Error,
		AdminAssignShipment
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminAssignShipment) =>
			client.admin.custom.post(`/admin/fulfillment/${payload.fulfillment_id}`, {
				status: payload.status,
			}),
		buildOptions(
			queryClient,
			[fulfillmentKeys.lists(), fulfillmentKeys.details()],
			options
		)
	);
};
