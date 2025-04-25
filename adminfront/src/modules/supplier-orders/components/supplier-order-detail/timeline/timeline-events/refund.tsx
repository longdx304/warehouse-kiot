import React from 'react';
import { formatAmountWithSymbol } from '@/utils/prices';
import { WalletMinimal } from 'lucide-react';
import EventContainer from './event-container';
import { RefundEvent } from '@/modules/supplier-orders/hooks/use-build-timeline';

type RefundEventProps = {
	event: RefundEvent;
};

const Refund: React.FC<RefundEventProps> = ({ event }) => {
	const args = {
		icon: <WalletMinimal size={20} />,
		title: 'Hoàn tiền',
		time: event.time,
		midNode: (
			<span className="font-normal text-gray-500">
				{formatAmountWithSymbol({
					amount: event.amount,
					currency: event.currencyCode,
				})}
			</span>
		),
		children: (
			<div className="gap-y-2 flex w-full flex-col">
				{event.reason && (
					<span className="text-gray-500">{`Lý do: ${event.reason
						.slice(0, 1)
						.toUpperCase()}${event.reason.slice(1)}`}</span>
				)}
				{event.note && (
					<div className="bg-gray-50 px-2 py-2 rounded-2xl">
						Ghi chú: {event.note}
					</div>
				)}
			</div>
		),
	};

	return <EventContainer {...args} />;
};

export default Refund;
