import { ActionAbles } from '@/components/Dropdown';

type NumberedItemProps = {
	actions?: any[];
	index: number;
	title: string;
	description?: React.ReactNode | string;
};

const NumberedItem: React.FC<NumberedItemProps> = ({
	actions,
	index,
	title,
	description,
}) => {
	return (
		<div className="p-4 rounded-lg gap-4 flex items-center justify-between border border-solid border-gray-200">
			<div className="gap-4 flex w-full overflow-hidden">
				<div className="aspect-square h-[44px] w-auto flex items-center justify-center bg-gray-200 rounded-lg text-sm text-gray-500">{`§${
					index + 1
				}`}</div>
				<div className="flex w-full flex-1 flex-col justify-center truncate gap-1">
					<div className="font-semibold">{title}</div>
					{description &&
						(typeof description === 'string' ? (
							<div className="text-gray-400 text-xs">{description}</div>
						) : (
							description
						))}
				</div>
			</div>
			{actions && (
				<div>
					<ActionAbles actions={actions} />
				</div>
			)}
		</div>
	);
};

export default NumberedItem;
