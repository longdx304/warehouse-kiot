import { Flex as AntdFlex, FlexProps } from 'antd';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props extends FlexProps {
	className?: string;
	children: ReactNode;
	wrap?: any;
}

export default function Flex({
	className,
	wrap = false,
	children,
	...props
}: Props) {
	return (
		<AntdFlex wrap={wrap} className={cn('', className)} {...props}>
			{children}
		</AntdFlex>
	);
}
