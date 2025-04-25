import { cn } from '@/lib/utils';
import React, { ReactNode, useState } from 'react';
import { TooltipIcon, Tooltip } from '@/components/Tooltip';
import { BellOff, ChevronDown, ChevronUp } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Button } from '@/components/Button';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export enum EventIconColor {
	GREEN = 'text-emerald-400',
	RED = 'text-rose-500',
	ORANGE = 'text-orange-400',
	VIOLET = 'text-violet-600',
	DEFAULT = 'text-gray-500',
}

export type EventContainerProps = {
	icon: React.ReactNode;
	iconColor?: EventIconColor;
	title: string;
	time: Date;
	noNotification?: boolean;
	topNode?: React.ReactNode;
	midNode?: React.ReactNode;
	isFirst?: boolean;
	expandable?: boolean;
	children?: ReactNode;
	detail?: string | React.ReactNode;
};

const EventContainer: React.FC<EventContainerProps> = ({
	icon,
	iconColor = EventIconColor.DEFAULT,
	title,
	topNode,
	midNode,
	time,
	noNotification = false,
	isFirst = false,
	expandable = false,
	children,
	detail,
}) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(!expandable);

	const toggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};

	return (
		<div className="mb-4">
			<div className="flex items-center justify-between">
				<div className="gap-x-2 flex items-center">
					<div className={cn('h-5 w-5', iconColor)}>{icon}</div>
					<div className="font-semibold text-[12px]">{title}</div>
					<div className="font-medium text-gray-500"></div>
				</div>
				<div className="gap-x-2 flex items-center">
					{noNotification && (
						<TooltipIcon
							title="Notifications related to this event are disabled"
							icon={<BellOff size={20} className="text-gray-400" />}
						/>
					)}
					{topNode}
					{expandable && (
						<Button type="text" onClick={toggleExpand}>
							{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						</Button>
					)}
				</div>
			</div>
			<div className="gap-x-2 flex">
				<div className="pt-base flex w-5 justify-center">
					{!isFirst && <div className="min-h-[24px] w-px" />}
				</div>
				<div className="font-normal mt-0 w-full">
					<div className="flex items-center">
						<Tooltip title={dayjs(time).format('dddd, DD MMM YYYY HH:mm:ss')}>
							<div className="font-normal text-gray-500 text-[12px]">
								{dayjs(time).fromNow()}
							</div>
						</Tooltip>
						{midNode && (
							<span className="mx-2">
								<Dot />
							</span>
						)}
						{midNode}
					</div>
					{children && isExpanded && (
						<div className="mt-2 pb-0 w-full">{children}</div>
					)}
					<div className="text-gray-500">{detail}</div>
				</div>
			</div>
		</div>
	);
};

const Dot = ({ size = '2px', bg = 'bg-gray-500' }) => {
	return <div className={`aspect-square h-[3px] w-[3px] ${bg} rounded-full`} />;
};

export default EventContainer;
