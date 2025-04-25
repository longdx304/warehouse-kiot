import { AdminUploadsRes } from '@medusajs/medusa';
import { buildOptions } from '@/utils/build-options';
import { Response } from '@medusajs/medusa-js';
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useMedusa } from 'medusa-react';

export type AdminCreateUploadPayload = {
	files: File | File[];
	prefix?: string;
};

export const useAdminUploadFile = (
	options?: UseMutationOptions<Response<AdminUploadsRes>, Error, AdminCreateUploadPayload>
) => {
	const { client } = useMedusa();
	const queryClient = useQueryClient();

	return useMutation((payload: AdminCreateUploadPayload) => {
		const _payload = _createPayload(payload);
		return client.admin.custom.post(`/admin/uploads`, _payload);
	}, buildOptions(queryClient, [], options));
};

const _createPayload = (payload: AdminCreateUploadPayload) => {
	const _payload = new FormData();
	const { files, prefix } = payload;
	if (Array.isArray(files)) {
		files.forEach((f) => _payload.append('files', f));
	} else {
		_payload.append('files', files);
	}

	if (prefix) {
		_payload.append('prefix', prefix);
	}

	return _payload;
};
