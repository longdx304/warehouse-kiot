import { Flex } from '@/components/Flex';
import ManageReturnReasons from '@/modules/return-reasons/templates/manage-return-reasons';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý lý do trả hàng',
	description: 'Trang quản lý lý do trả hàng',
};

interface Props {}

export default async function ReturnReasons({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ManageReturnReasons />
		</Flex>
	);
}