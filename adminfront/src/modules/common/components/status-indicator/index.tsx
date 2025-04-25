import clsx from 'clsx';
import React from 'react';

type StatusIndicatorProps = {
	title?: string;
	variant: 'primary' | 'danger' | 'warning' | 'success' | 'active' | 'default';
} & React.HTMLAttributes<HTMLDivElement>;

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
	title,
	variant = 'success',
	className,
	...props
}) => {
	const dotClass = clsx({
		'bg-teal-500': variant === 'success',
		'bg-rose-500': variant === 'danger',
		'bg-yellow-500': variant === 'warning',
		'bg-violet-600': variant === 'primary',
		'bg-emerald-400': variant === 'active',
		'bg-gray-400': variant === 'default',
	});
	return (
		<div
			className={clsx('font-medium flex items-center', className, {
				'hover:bg-gray-500 cursor-pointer': !!props.onClick,
			})}
			{...props}
		>
			<div className={clsx('h-1.5 w-1.5 self-center rounded-full', dotClass)} />
			{title && <span className="ml-2 font-normal">{title}</span>}
		</div>
	);
};

export default StatusIndicator;
