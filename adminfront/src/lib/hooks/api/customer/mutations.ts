import { buildOptions } from '@/utils/build-options';
import { AddressCreatePayload, Customer } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { customerKeys, useMedusa } from 'medusa-react';

export const useAdminAddCustomerAddress = (
	customerId: string,
	options?: UseMutationOptions<Response<Customer>, Error, AddressCreatePayload>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AddressCreatePayload) =>
			client.admin.custom.post(
				`/admin/customers/${customerId}/address`,
				payload
			),
		buildOptions(queryClient, [customerKeys.detail(customerId)], options)
	);
};
