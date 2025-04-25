import React from 'react';
import { PaidEvent } from '@/modules/orders/hooks/use-build-timeline';
import { formatAmountWithSymbol } from '@/utils/prices';
import { HandCoins } from 'lucide-react';
import EventContainer from './event-container';

type PaidEventProps = {
	event: PaidEvent;
};

const Paid: React.FC<PaidEventProps> = ({ event }) => {
	const args = {
		icon: <HandCoins size={20} />,
		title: 'Thu tiền',
		time: event.time,
		midNode: (
			<span className="font-normal text-gray-500">
				{formatAmountWithSymbol({
					amount: event.amount,
					currency: event.currencyCode,
				})}
			</span>
		),
	};

	return <EventContainer {...args} />;
};

export default Paid;
