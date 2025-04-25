import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import PricingList from '@/modules/pricing/templates/pricing-list';

export const metadata: Metadata = {
	title: 'Quản lý định giá',
	description: 'Trang quản lý định giá.',
};

interface Props {}

export default async function Pricing({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<PricingList />
		</Flex>
	);
}
