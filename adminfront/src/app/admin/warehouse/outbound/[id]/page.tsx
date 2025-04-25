import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import { ProductUnitProvider } from '@/lib/providers/product-unit-provider';
import OutboundDetail from '@/modules/warehouse/outbound/templates/outbound-detail';

export const metadata: Metadata = {
	title: 'Chi tiết xuất kho',
	description: 'Trang quản lý xuất kho.',
};

interface Props {
	params: { id: string };
}

export default async function OutboundDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ProductUnitProvider>
				<OutboundDetail id={params.id} />
			</ProductUnitProvider>
		</Flex>
	);
}
