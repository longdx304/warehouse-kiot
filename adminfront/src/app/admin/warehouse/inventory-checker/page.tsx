import { Flex } from '@/components/Flex';
import InventoryChecker from '@/modules/warehouse/inventory-checker/templates/inventory';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý kiểm kho',
	description: 'Trang quản lý kiểm kho hàng.',
};

interface Props {}

export default async function InventoryCheckerPage({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<InventoryChecker />
		</Flex>
	);
}
