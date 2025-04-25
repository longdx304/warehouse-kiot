import { Flex } from '@/components/Flex';
import CurrencyList from '@/modules/currencies/templates/manage-currencies';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý tiền tệ',
	description: 'Trang quản lý tiền tệ',
};

interface Props {}

export default async function Currencies({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<CurrencyList />
		</Flex>
	);
}
