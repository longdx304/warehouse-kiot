import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { queryKeysFactory, useMedusa } from 'medusa-react';

const ADMIN_ORDER = `admin_order` as const;

export const adminOrderKeys = queryKeysFactory(ADMIN_ORDER);

interface AdminOrderAsignRes {
	success: boolean;
}

interface AdminPostOrderAssignReq {
	handler_id: string;
}

export const useAdminAsignOrder = (
	id: string,
	options?: UseMutationOptions<
		Response<AdminOrderAsignRes>,
		Error,
		AdminPostOrderAssignReq
	>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminPostOrderAssignReq) =>
			client.admin.custom.post(`/admin/order/${id}`, payload),
		buildOptions(queryClient, [adminOrderKeys.lists()], options)
	);
};
