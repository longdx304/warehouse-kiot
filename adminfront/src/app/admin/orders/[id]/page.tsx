import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import OrderDetail from '@/modules/orders/templates/order-detail';
import { OrderEditProvider } from '@/modules/orders/components/orders/edit-order-modal/context';

export const metadata: Metadata = {
	title: 'Chi tiết đơn hàng',
	description: 'Trang quản đơn hàng.',
};

interface Props {
	params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<OrderEditProvider orderId={params.id!}>
				<OrderDetail id={params.id} />
			</OrderEditProvider>
		</Flex>
	);
}
