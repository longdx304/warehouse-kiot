import { Flex } from '@/components/Flex';
import ListInbound from '@/modules/warehouse/inbound/templates/list-inbound';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Nhập kho',
	description: 'Trang quản lý nhập hàng.',
};

interface Props {}

export default async function InBound({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ListInbound />
		</Flex>
	);
}
