'use client';
import { Card } from '@/components/Card';
import { FC } from 'react';
import OrderList from './orders';

type Props = {};

const ManageOrders: FC<Props> = ({}) => {
	return (
		<Card className="w-full" bordered={false}>
			<OrderList />
		</Card>
	);
};

export default ManageOrders;
