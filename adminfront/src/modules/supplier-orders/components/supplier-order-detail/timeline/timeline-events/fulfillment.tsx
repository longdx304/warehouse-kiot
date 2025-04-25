import React from 'react';
import { Package2, PackageCheck, PackageX } from 'lucide-react';
import EventContainer from './event-container';
import { TimelineEvent } from '@/modules/supplier-orders/hooks/use-build-timeline';

type OrderPlacedProps = {
	event: TimelineEvent;
};

const Fulfillment: React.FC<OrderPlacedProps> = ({ event }) => {
	const icon =
		event.type === 'fulfillment-delivered' ? (
			<PackageCheck size={20} />
		) : event.type === 'fulfillment-inventoried' ? (
			<Package2 size={20} />
		) : (
			<PackageX size={20} />
		);

	const title =
		event.type === 'fulfillment-delivered'
			? 'Hàng đã về kho'
			: event.type === 'fulfillment-inventoried'
			? 'Đã nhập hàng vào kho'
			: 'Đã hủy nhận hàng';

	const args = {
		icon,
		time: event.time,
		title,
		// midNode: (
		// 	<div className="font-normal text-[12px] text-gray-500">
		// 		{formatAmountWithSymbol({
		// 			amount: event.amount,
		// 			currency: event.currency_code,
		// 		})}
		// 	</div>
		// ),
		// isFirst: event.first,
	};
	return <EventContainer {...args} />;
};

export default Fulfillment;
