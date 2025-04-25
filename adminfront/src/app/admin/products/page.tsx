import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import ManageProduct from '@/modules/products/components/manage-product';

export const metadata: Metadata = {
	title: 'Quản lý sản phẩm',
	description: 'Trang quản lý sản phẩm.',
};

interface Props {}

export default async function Products({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ManageProduct />
		</Flex>
	);
}
