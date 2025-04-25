import { Flex } from '@/components/Flex';
import ManageOrders from '@/modules/orders/templates/manage-orders';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Quản lý đơn hàng',
	description: 'Trang quản lý đơn hàng',
};

interface Props {}

export default async function Orders({}: Props) {
	return (
		<Suspense>
			<Flex vertical gap="middle" className="h-full w-full">
				<ManageOrders />
			</Flex>
		</Suspense>
	);
}
