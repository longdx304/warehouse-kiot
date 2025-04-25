import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import SupplierList from '@/modules/suppliers/templates/suppliers-list';

export const metadata: Metadata = {
	title: 'Quản lý nhà cung cấp',
	description: 'Trang quản lý nhà cung cấp',
};

export default function Suppliers() {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<SupplierList />
		</Flex>
	);
}
