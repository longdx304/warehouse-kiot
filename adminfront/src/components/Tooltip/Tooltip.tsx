import { cn } from '@/lib/utils';
import { Tooltip as AntdTooltip, TooltipProps } from 'antd';
import { ReactNode } from 'react';

type Props = TooltipProps & {
	className?: string;
	title: ReactNode;
	children?: ReactNode;
};

export default function Tooltip({
	title,
	className,
	children,
	...props
}: Props) {
	return (
		<AntdTooltip
			className={cn('!text-sm text-black', className)}
			color="white"
			title={title}
			{...props}
		>
			{children}
		</AntdTooltip>
	);
}
