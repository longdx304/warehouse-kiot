import { Flex } from '@/components/Flex';
import ListOutbound from '@/modules/warehouse/outbound/templates/list-outbound';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Xuất kho',
	description: 'Trang quản lý xuất kho.',
};

interface Props {}

export default async function Outbound({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ListOutbound />
		</Flex>
	);
}
