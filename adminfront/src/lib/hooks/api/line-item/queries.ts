import { useQuery } from '@tanstack/react-query';
import {
	queryKeysFactory,
	useMedusa,
} from 'medusa-react';

export const ADMIN_LINEITEM = `admin_lineitem` as const;

export const adminLineItemKeys = queryKeysFactory(ADMIN_LINEITEM);

export const useAdminLineItem = (id: string) => {
	const { client } = useMedusa();
	const { data, ...rest } = useQuery(
		adminLineItemKeys.detail(id),
		() => client.admin.custom.get(`/admin/line-item/${id}`),
		{
			enabled: !!id,
		}
	);
	return { ...data, ...rest } as const;
};
