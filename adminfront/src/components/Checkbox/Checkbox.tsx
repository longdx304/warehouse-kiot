import { Checkbox as AntdCheckbox, CheckboxProps } from 'antd';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props extends CheckboxProps {
	className?: string;
	children?: ReactNode;
	value?: string | number;
}

export default function Checkbox({ className, value, children, ...props }: Props) {
	return (
		<AntdCheckbox value={value} className={cn('', className)} {...props}>
			{children}
		</AntdCheckbox>
	);
}
