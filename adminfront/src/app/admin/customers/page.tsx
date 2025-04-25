import { Flex } from '@/components/Flex';
import ManageCustomer from '@/modules/customers/templates/manage-customer';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý khách hàng',
	description: 'Trang quản lý khách hàng.',
};

interface Props {}

export default async function Customers({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ManageCustomer />
		</Flex>
	);
}
