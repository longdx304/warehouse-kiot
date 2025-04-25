import LoginTemplate from '@/modules/account/components/login';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign in',
	description: 'Sign in to your Admin account.',
};

export default function Login() {
	return <LoginTemplate />;
}
