import { Flex } from '@/components/Flex';
import ManageDraftOrders from '@/modules/draft-orders/manage-draft-orders';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Quản lý đơn hàng',
	description: 'Trang quản lý đơn hàng',
};

interface Props {}

export default async function DraftOrders({}: Props) {
	return (
		<Suspense>
			<Flex vertical gap="middle" className="h-full w-full">
				<ManageDraftOrders />
			</Flex>
		</Suspense>
	);
}
