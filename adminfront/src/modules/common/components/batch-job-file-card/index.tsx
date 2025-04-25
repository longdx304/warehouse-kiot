import { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/Tooltip';

type Props = {
	fileName: string;
	fileSize?: string;
	errorMessage?: string;
	hasError?: boolean;
	icon?: ReactNode;
	onClick?: () => void;
};

const BatchJobFileCard = ({
	fileName,
	fileSize,
	icon,
	onClick,
	hasError,
	errorMessage,
}: Props) => {
	const preparedOnClick = onClick ?? (() => void 0);

	return (
		<div
			className="mt-4 flex w-full cursor-pointer items-center"
			onClick={preparedOnClick}
		>
			<div
				className="border-solid border-gray-200 flex items-center text-xs justify-center rounded-lg border p-2.5"
				title={fileName}
			>
				{!!icon && icon}
			</div>

			<div className="relative w-full pl-4 text-left">
				<div className="font-normal max-w-[80%] overflow-hidden truncate text-xs">
					{fileName}
				</div>

				<Tooltip
					className=""
					open={hasError ? undefined : false}
					title={
						hasError && errorMessage ? (
							<span className="font-normal text-rose-500">{errorMessage}</span>
						) : null
					}
				>
					{!!fileSize && (
						<div
							className={cn('text-gray-400 font-normal text-xs', hasError && 'text-rose-500')}
						>
							{fileSize}
						</div>
					)}
				</Tooltip>
			</div>
		</div>
	);
};

export default BatchJobFileCard;
