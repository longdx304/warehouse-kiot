import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import ProductDetail from '@/modules/products/components/product-detail';

export const metadata: Metadata = {
	title: 'Chi tiết sản phẩm',
	description: 'Trang quản lý sản phẩm.',
};

interface Props {
	params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ProductDetail id={params.id} />
		</Flex>
	);
}
