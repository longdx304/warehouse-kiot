import { Flex } from '@/components/Flex';
import DiscountList from '@/modules/discounts/templates/discounts';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý mã giảm giá',
	description: 'Trang quản lý mã giảm giá',
};

interface Props {}

export default async function Discounts(props: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<DiscountList />
		</Flex>
	);
}
