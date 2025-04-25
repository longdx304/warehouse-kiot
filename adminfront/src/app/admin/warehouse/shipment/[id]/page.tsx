import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import ShipmentDetail from '@/modules/warehouse/shipment/templates/shipment-detail';

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
			<ShipmentDetail id={params.id} />
		</Flex>
	);
}
