import { Flex } from '@/components/Flex';
import ManageItemUnit from '@/modules/item-unit/templates/manage-item-unit';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý đơn vị hàng',
	description: 'Trang quản lý đơn vị hàng',
};

interface Props {}

export default async function Currencies({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ManageItemUnit />
		</Flex>
	);
}
