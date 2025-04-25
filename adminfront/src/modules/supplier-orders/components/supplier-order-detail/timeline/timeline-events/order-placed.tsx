import React from 'react';
import { OrderPlacedEvent } from '@/modules/orders/hooks/use-build-timeline';
import { formatAmountWithSymbol } from '@/utils/prices';
import { CircleCheck } from 'lucide-react';
import EventContainer from './event-container';

type OrderPlacedProps = {
	event: OrderPlacedEvent;
};

const OrderPlaced: React.FC<OrderPlacedProps> = ({ event }) => {
	const args = {
		icon: <CircleCheck size={20} />,
		time: event.time,
		title: 'Đã đặt hàng',
		midNode: (
			<div className="font-normal text-[12px] text-gray-500">
				{formatAmountWithSymbol({
					amount: event.amount,
					currency: event.currency_code,
				})}
			</div>
		),
		isFirst: event.first,
	};
	return <EventContainer {...args} />;
};

export default OrderPlaced;
