import { Flex } from '@/components/Flex';
import ManageRegion from '@/modules/regions/templates/manage-region';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý khu vực',
	description: 'Trang quản lý khu vực',
};

interface Props {}

export default async function Regions({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ManageRegion />
		</Flex>
	);
}