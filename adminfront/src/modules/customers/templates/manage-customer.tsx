'use client';

import { Card } from '@/components/Card';
import { Tabs } from '@/components/Tabs';
import { TabsProps } from 'antd';
import { FC } from 'react';
import CustomerList from './customers/customer-list';
import CustomerGroupList from './customer-group/customer-group-list';

type Props = {};

const ManageCustomer: FC<Props> = ({}) => {
	const itemTabs: TabsProps['items'] = [
		{
			key: 'customers',
			label: 'Khách hàng',
			children: <CustomerList />,
		},
		{
			key: 'customer-groups',
			label: 'Nhóm khách hàng',
			children: <CustomerGroupList />,
		},
	];
	return (
		<Card className="w-full" bordered={false}>
			<Tabs items={itemTabs} />
		</Card>
	);
};

export default ManageCustomer;
