import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import DiscountDetail from '@/modules/discounts/templates/discount-detail';

export const metadata: Metadata = {
	title: 'Chi tiết mã giảm giá',
	description: 'Trang quản mã giảm giá.',
};

interface Props {
	params: { id: string };
}

export default async function DiscountDetailPage({ params }: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<DiscountDetail id={params.id} />
		</Flex>
	);
}
