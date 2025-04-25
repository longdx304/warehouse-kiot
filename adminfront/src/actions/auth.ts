'use server';

import { cookies } from 'next/headers';

export async function setCookie(access_token: any) {
	access_token &&
		cookies().set('_admin_chamdep_jwt', access_token, {
			maxAge: 60 * 60 * 24 * 7,
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
		});
	return [];
}
export async function removeCookie() {
	cookies().set('_admin_chamdep_jwt', '', {
		maxAge: -1,
	});
	return [];
}
