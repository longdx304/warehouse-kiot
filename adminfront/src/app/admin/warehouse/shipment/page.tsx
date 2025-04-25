import { Flex } from '@/components/Flex';
import ListShipment from '@/modules/warehouse/shipment/templates/list-shipment';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Vận chuyển hàng',
	description: 'Trang quản lý vận chuyển hàng.',
};

interface Props {}

export default async function Ship({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ListShipment />
		</Flex>
	);
}
