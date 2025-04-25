import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import DraftOrderDetail from '@/modules/draft-orders/templates/draft-order-detail';

export const metadata: Metadata = {
	title: 'Chi tiết đơn hàng',
	description: 'Trang quản đơn hàng.',
};

interface Props {
	params: { id: string };
}

export default async function DraftOrderDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<DraftOrderDetail id={params.id} />
		</Flex>
	);
}
