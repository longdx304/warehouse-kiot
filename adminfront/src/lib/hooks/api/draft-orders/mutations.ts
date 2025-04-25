import { buildOptions } from '@/utils/build-options';
import { DraftOrder } from '@medusajs/medusa';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { adminDraftOrderKeys, adminOrderKeys, useMedusa } from 'medusa-react';

export type AdminDraftOrderTransferRes = {
	draft_order: DraftOrder;
};

export type AdminDraftOrderTransferReq = {
	id: string;
	isSendEmail?: boolean;
	urlPdf: string;
};

export const useAdminDraftOrderTransferOrder = (
	options?: UseMutationOptions<
		Response<AdminDraftOrderTransferRes>,
		Error,
		AdminDraftOrderTransferReq
	>
) => {
	const { client } = useMedusa();

	const queryClient = useQueryClient();

	return useMutation(
		(payload: AdminDraftOrderTransferReq) =>
			client.admin.custom.post(`/admin/draft-orders/${payload.id}/transfer`, {
				isSendEmail: payload.isSendEmail,
				urlPdf: payload.urlPdf,
			}),
		buildOptions(
			queryClient,
			[
				adminDraftOrderKeys.details(),
				adminDraftOrderKeys.lists(),
				adminOrderKeys.lists(),
			],
			options
		)
	);
};
