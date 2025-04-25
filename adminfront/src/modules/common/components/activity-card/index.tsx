import React, { ReactNode } from 'react';
import { Dot } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/Tooltip';

export type ActivityCardProps = {
	key?: string;
	title: string;
	icon?: ReactNode;
	relativeTimeElapsed?: string;
	date?: string | Date;
	shouldShowStatus?: boolean;
	children?: ReactNode[];
};

const ActivityCard: React.FC<ActivityCardProps> = (
	props: ActivityCardProps
) => {
	const { key, title, icon, relativeTimeElapsed, shouldShowStatus, children } =
		props;

	const date =
		!!props.date &&
		new Date(props.date).toLocaleDateString('en-us', {
			hour12: true,
			day: '2-digit',
			month: 'short',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});
	const formattedDate = !!date && date.replace(',', ' at');

	const getTimeElement = () => {
		return (
			<div className="flex cursor-default items-center text-xs">
				{!!relativeTimeElapsed && <span>{relativeTimeElapsed}</span>}
				{shouldShowStatus && (
					<Dot size={30} color="rgb(37 99 235)"/>
				)}
			</div>
		);
	};

	return (
		<div key={key} className="border-solid border-0 border-b border-gray-200 last:border-b-0">
			<div className="hover:bg-gray-100 flex py-6 px-2 rounded-md cursor-default">
				<div className="relative h-full w-full">
					<div className="font-medium text-gray-900 flex justify-between items-center">
						<div className="flex">
							{!!icon && icon}
							<span className="text-xs font-semibold">{title}</span>
						</div>

						{(!!relativeTimeElapsed || shouldShowStatus) &&
							(formattedDate ? (
								<Tooltip
									className=""
									title={formattedDate}
								>
									{getTimeElement()}
								</Tooltip>
							) : (
								getTimeElement()
							))}
					</div>

					<div className={cn(!!icon && 'pl-8')}>{children}</div>
				</div>
			</div>
		</div>
	);
};

export default ActivityCard;
