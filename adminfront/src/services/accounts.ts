'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';

import { getToken } from '@/actions/accounts';
import { handleErrorZod } from '@/lib/utils';

const loginSchema = z.object({
	email: z.string().email('Email không đúng định dạng'),
	password: z.string().min(6, {
		message: 'Mật khẩu phải ít nhất phải có 6 ký tự',
	}),
});

export async function adminLogIn(_currentState: unknown, formData: FormData) {
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const resolver = handleErrorZod(loginSchema.safeParse({ email, password }));
		if (resolver) {
			return resolver;
		}
		// Medusa get token from user
		await getToken({ email, password }).then(() => {
			revalidateTag('admin');
		});
		return { result: null };
	} catch (error: any) {
		return { result: 'Email hoặc mật khẩu không đúng!' };
	}
}
