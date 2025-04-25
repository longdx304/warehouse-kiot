import { LineItem } from '@medusajs/medusa';
import { ReservationItemDTO } from '@medusajs/types';

import { Tooltip } from '@/components/Tooltip';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { formatAmountWithSymbol } from '@/utils/prices';
import Image from 'next/image';

type OrderLineProps = {
	item: LineItem;
	currencyCode: string;
	reservations?: ReservationItemDTO[];
	isAllocatable?: boolean;
	paymentStt?: string;
	refetch: () => void;
};

const OrderLine = ({
	item,
	currencyCode,
	reservations,
	isAllocatable = true,
	paymentStt = '',
	refetch,
}: OrderLineProps) => {
	const tooltipContent = `${item?.title} - ${item?.variant?.title} (${
		item?.variant?.sku || ''
	})`;
	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] mb-1 flex h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item?.thumbnail ? (
						<Image
							src={item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${item.title}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<Tooltip title={tooltipContent}>
					<div className="flex flex-col justify-center text-[12px]">
						<span className="font-normal text-gray-900 truncate">
							{item?.title}
						</span>
						{item?.variant && (
							<span className="font-normal text-gray-500 truncate">
								{`${item.variant.title}`} x {item.quantity}
							</span>
						)}
					</div>
				</Tooltip>
			</div>
			<div className="flex items-center">
				<div className="space-x-2 lg:space-x-4 2xl:space-x-6 flex flex-col items-end text-[12px]">
					<div className="flex items-center gap-2 font-normal text-gray-500">
						{formatAmountWithSymbol({
							amount: (item?.subtotal ?? 0) / item?.quantity,
							currency: currencyCode,
							tax: [],
						})}
					</div>
					<div className="font-normal text-gray-900 min-w-[55px] text-right">
						{formatAmountWithSymbol({
							amount: item.subtotal ?? 0,
							currency: currencyCode,
							tax: [],
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderLine;
