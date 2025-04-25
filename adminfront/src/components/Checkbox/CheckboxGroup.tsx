import { cn } from '@/lib/utils';
import { Checkbox as AntdCheckbox, CheckboxProps } from 'antd';
import { ReactNode } from 'react';

interface Props extends CheckboxProps {
	className?: string;
	children?: ReactNode;
	error?: string;
	options?: any;
	value?: string[];
	onChange?: any;
}

export default function CheckboxGroup({
	error,
	className,
	children,
	options,
	onChange,
	value,
	...props
}: Props) {
	return (
		<AntdCheckbox.Group
			className={cn('', className)}
			{...props}
			options={options}
			onChange={onChange}
			value={value}
		>
			{children}
		</AntdCheckbox.Group>
	);
}
