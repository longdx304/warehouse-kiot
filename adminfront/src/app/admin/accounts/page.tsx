import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import AccountList from '@/modules/account/components/account-list';

export const metadata: Metadata = {
	title: 'Quản lý nhân viên',
	description: 'Trang quản lý nhân viên',
};


export default function Accounts() {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<AccountList />
		</Flex>
	);
}
