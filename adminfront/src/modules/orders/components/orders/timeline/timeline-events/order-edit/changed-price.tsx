import { CircleDollarSign } from 'lucide-react';
import EventContainer from '../event-container';
import Image from 'next/image';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { Region } from '@medusajs/medusa';
import { formatAmountWithSymbol } from '@/utils/prices';

type Props = {
	event: any;
	region: Region | undefined;
};

const ChangedPrice: React.FC<Props> = ({ event, region }) => {
	return (
		<EventContainer
			title={'Chỉnh sửa giá'}
			time={event.time}
			isFirst={event.first}
			icon={<CircleDollarSign size={20} />}
			// midNode={<ByLine user={user || customer} />}
		>
			<div className="mb-4">
				<ItemChangedPrice event={event} region={region} />
			</div>
		</EventContainer>
	);
};

export default ChangedPrice;

const ItemChangedPrice: React.FC<Props> = ({ event, region }) => {
	const taxRate = event?.rate ?? 0;
	return (
		<div className="flex justify-between items-center">
			<div className="gap-x-4 flex">
				<div>
					<div className="rounded-md flex h-[40px] w-[30px] overflow-hidden">
						{event?.thumbnail ? (
							// eslint-disable-next-line @next/next/no-img-element
							<Image
								height={40}
								width={32}
								src={event.thumbnail}
								className="object-cover"
								alt=""
							/>
						) : (
							<PlaceholderImage />
						)}
					</div>
				</div>
				<div className="flex flex-col justify-center">
					<span className="font-medium text-gray-900">{event?.title}</span>
					<span className="font-medium text-gray-500">
						{event.quantity > 1 && <>{`x${event.quantity}`}</>}
					</span>
				</div>
			</div>
			<div className="flex flex-col">
				<div className="text-gray-500 line-through">
					{formatAmountWithSymbol({
						amount: Math.round(event.old_price * (1 + taxRate / 100)),
						currency: region?.currency_code ?? 'VND',
					})}
				</div>
				<div className="text-gray-900">
					{formatAmountWithSymbol({
						amount: Math.round(event.unit_price * (1 + taxRate / 100)),
						currency: region?.currency_code ?? 'VND',
					})}
				</div>
			</div>
		</div>
	);
};
