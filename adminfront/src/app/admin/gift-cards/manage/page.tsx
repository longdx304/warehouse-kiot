import { Flex } from '@/components/Flex';
import GiftCardManage from '@/modules/gift-card/templates/manage';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý gift card',
	description: 'Trang quản lý gift card',
};

interface Props {}

export default async function GiftCard(props: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<GiftCardManage />
		</Flex>
	);
}
