/* eslint-disable @next/next/no-img-element */
import React from 'react';

type EventItemContainerProps = {
	item: {
		thumbnail?: string;
		title: string;
		quantity: number;
		variant: {
			title: string;
		};
	};
	detail?: string;
};

const EventItemContainer: React.FC<EventItemContainerProps> = ({
	item,
	detail,
}) => {
	if (!item) {
		return null;
	}

	return (
		<div className="mb-2 flex flex-col last:mb-0 ">
			<div className="gap-x-2 flex items-center">
				{item.thumbnail && (
					<div className="rounded-sm h-10 w-[30px] overflow-hidden">
						<img
							src={item.thumbnail}
							alt={`Thumbnail for ${item.title}`}
							className="h-full w-full object-cover"
						/>
					</div>
				)}
				<div className="font-normal flex w-full flex-col">
					<div className="flex w-full items-center justify-between">
						<p className="my-0 font-medium text-[12px]">{item.title}</p>
						<span className="font-semibold text-violet-600">{`x${item.quantity}`}</span>
					</div>
					<span className="text-gray-500 text-[12px]">
						{item.variant.title}
					</span>
				</div>
			</div>
			{detail && <div className="text-gray-500">{detail}</div>}
		</div>
	);
};

export default EventItemContainer;
