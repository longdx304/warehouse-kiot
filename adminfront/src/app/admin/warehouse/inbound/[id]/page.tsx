import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import InboundDetail from '@/modules/warehouse/inbound/templates/inbound-detail';
import { ProductUnitProvider } from '@/lib/providers/product-unit-provider';

export const metadata: Metadata = {
	title: 'Chi tiết nhập kho',
	description: 'Trang quản lý nhập kho.',
};

interface Props {
	params: { id: string };
}

export default async function InboundDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ProductUnitProvider>
				<InboundDetail id={params.id} />
			</ProductUnitProvider>
		</Flex>
	);
}
