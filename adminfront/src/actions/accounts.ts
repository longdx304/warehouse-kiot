'use server';

// Authentication actions
import { medusaClient } from '@/lib/database/config';
import isEmpty from 'lodash/isEmpty';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { IAdminAuth, IAdminResponse, IUserRequest } from '@/types/account';
import { TResponse } from '@/types/common';
import { getMedusaHeaders } from './common';

/**
 */
export async function getToken(credentials: IAdminAuth) {
	return medusaClient.admin.auth
		.getToken(credentials, {
			next: {
				tags: ['auth'],
			},
		})
		.then(({ access_token }) => {
			access_token &&
				cookies().set('_admin_chamdep_jwt', access_token, {
					maxAge: 60 * 60 * 24 * 7,
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
				});
			return [];
		})
		.catch((error: any) => {
			return 'Email hoặc mật khẩu không đúng!';
		});
}

/**
 * Get information admin
 */
export async function getAdmin() {
	const headers = await getMedusaHeaders(['auth']);

	return medusaClient.admin.auth
		.getSession(headers)
		.then(({ user }) => user)
		.catch((error) => console.log('error', error));
}

/**
 * User Logout
 */
export async function signOut() {
	cookies().set('_admin_chamdep_jwt', '', {
		maxAge: -1,
	});
}

export async function listUser(
	searchParams: Record<string, unknown>
): Promise<TResponse<IAdminResponse> | null> {
	try {
		const headers = await getMedusaHeaders(['users']);
		const limitData: number = (searchParams?.limit as number) ?? 10;

		const page = searchParams?.page ?? 1;
		const offsetData = +limitData * (+page - 1);
		delete searchParams.page;

		const { users, count, offset, limit } = await medusaClient.admin.users.list(
			{ ...searchParams, limit: limitData, offset: offsetData },
			headers
		);

		return {
			data: users,
			count,
			offset,
			limit,
		} as unknown as TResponse<IAdminResponse>;
	} catch (error) {
		return null;
	}
}

export async function createUser(payload: IUserRequest) {
	const headers = await getMedusaHeaders(['users']);
	const { email, fullName, phone, permissions } = payload;

	return medusaClient.admin.users
		.create(
			{
				email,
				password: '123456',
				first_name: fullName,
				phone,
				permissions: permissions.join(','),
			} as any,
			headers
		)
		.then(async (data) => {
			if (!isEmpty(data.user)) {
				// await setMetadata(user.id, { phone, rolesUser });
				revalidateTag('users');
				return data.user;
			}
		})
		.catch((error: any) => {
			throw new Error(error?.response?.data?.message ?? '');
		});
}

export async function updateUser(userId: string, payload: IUserRequest) {
	const headers = await getMedusaHeaders(['users']);
	const { fullName, phone, permissions } = payload;
	return medusaClient.admin.users
		.update(
			userId,
			{
				first_name: fullName,
				phone,
				permissions: permissions.join(','),
			} as any,
			headers
		)
		.then(async ({ user }) => {
			if (!isEmpty(user)) {
				// await setMetadata(user.id, { phone, rolesUser });
				revalidateTag('users');
				return user;
			}
		})
		.catch((error: any) => {
			throw new Error(error?.response?.data?.message ?? '');
		});
}

export async function deleteUser(userId: string) {
	const headers = await getMedusaHeaders(['users']);

	return medusaClient.admin.users
		.delete(userId, headers)
		.then(() => {
			revalidateTag('users');
			return;
		})
		.catch((error: any) => {
			throw new Error(error?.response?.data?.message ?? '');
		});
}
