import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import FulfillmentDetail from '@/modules/warehouse/stock-checker/templates/fulfillment-detail';

export const metadata: Metadata = {
	title: 'Chi tiết kiểm hàng',
	description: 'Trang quản lý kiểm hàng.',
};

interface Props {
	params: { id: string };
}

export default async function StockDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<FulfillmentDetail id={params.id} />
		</Flex>
	);
}
