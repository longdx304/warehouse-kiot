import { Flex } from '@/components/Flex';
import ListFulfillment from '@/modules/warehouse/stock-checker/templates/list-fulfillment';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Kiểm hàng',
	description: 'Trang quản lý kiểm hàng.',
};

interface Props {}

export default async function StokChecker({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ListFulfillment />
		</Flex>
	);
}
