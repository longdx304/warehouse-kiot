import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import SupplierOrdersList from '@/modules/supplier-orders/templates/supplier-orders-list';

export const metadata: Metadata = {
	title: 'Quản lý nhà cung cấp',
	description: 'Trang nhập hàng',
};

export default function SupplierOrders() {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<SupplierOrdersList />
		</Flex>
	);
}
