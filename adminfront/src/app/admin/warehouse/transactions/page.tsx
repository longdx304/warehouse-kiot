import { Flex } from '@/components/Flex';
import ListTransaction from '@/modules/warehouse/transactions/templates/list-transactions';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sổ kho',
	description: 'Trang quản lý sổ kho.',
};

interface Props {}

export default async function Transactions({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ListTransaction />
		</Flex>
	);
}
