import { Card as AntdCard, CardProps } from 'antd';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props extends CardProps {
	className?: string;
	children?: ReactNode;
	rounded?: boolean;
}
export default function Card({
	className,
	rounded = false,
	children,
	...props
}: Props) {
	return (
		<AntdCard
			className={cn(
				'shadow-lg [&_.ant-card-body]:p-4',
				rounded ? 'rounded-xl' : 'max-sm:rounded-none',
				className
			)}
			bordered={false}
			{...props}
		>
			{children}
		</AntdCard>
	);
}
