import React from 'react';
import { Ban } from 'lucide-react';
import EventContainer, { EventIconColor } from './event-container';
import { TimelineEvent } from '@/modules/supplier-orders/hooks/use-build-timeline';

type OrderCanceledProps = {
	event: TimelineEvent;
};

const OrderCanceled: React.FC<OrderCanceledProps> = ({ event }) => {
	const args = {
		icon: <Ban size={20} />,
		iconColor: EventIconColor.RED,
		time: event.time,
		title: 'Đã huỷ đơn hàng',
	};
	return <EventContainer {...args} />;
};

export default OrderCanceled;
