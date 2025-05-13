'use server';

import { cookies } from 'next/headers';

const TOKEN_NAME = '_admin_chamdep_jwt';

export async function setCookie(token: string) {
	console.log('Setting cookie:', TOKEN_NAME, token ? 'has value' : 'empty');
	
	if (!token) {
		cookies().delete(TOKEN_NAME);
		return;
	}
	
	cookies().set({
		name: TOKEN_NAME,
		value: token,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-site redirects
		path: '/',
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}

export async function getCookie(): Promise<string | undefined> {
	const token = cookies().get(TOKEN_NAME);
	console.log('Getting cookie:', TOKEN_NAME, token ? 'exists' : 'not found');
	return token?.value;
}

export async function deleteCookie() {
	console.log('Deleting cookie:', TOKEN_NAME);
	cookies().delete(TOKEN_NAME);
}
