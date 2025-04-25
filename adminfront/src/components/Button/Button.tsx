'use client';
import { Button as AntdButton, ButtonProps as AntdButtonProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends AntdButtonProps {
	className?: string;
	icons?: React.ReactNode;
}

export default function Button({
	className,
	type = 'primary',
	children,
	icons,
	...props
}: Props) {
	return (
		<AntdButton
			className={cn('h-8 text-[14px] leading-none', className)}
			type={type}
			size="large"
			icon={icons}
			data-testid={props['data-testid']}
			{...props}
		>
			{children}
		</AntdButton>
	);
}
