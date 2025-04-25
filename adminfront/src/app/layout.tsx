import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { MedusaProvider } from '@/lib/providers/medusa-provider';
import theme from '../theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	manifest: '/manifest.json',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1"
				></meta>
			</head>
			<body className={inter.className}>
				<AntdRegistry>
					<ConfigProvider theme={theme}>
						<MedusaProvider>{children}</MedusaProvider>
					</ConfigProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
