import {
	DatePicker as AntdDatePicker,
	DatePickerProps as AntdDatePickerProps,
} from 'antd';
import { cn } from '@/lib/utils';

interface Props extends AntdDatePickerProps {
	className?: string;
	error?: string;
	format?: string;
}

export default function DatePicker({
	error,
	className,
	format = 'DD/MM/YYYY',
	...props
}: Props) {
	return (
		<AntdDatePicker
			className={cn('px-[6px] py-2 gap-2', className)}
			{...props}
			allowClear
			format={format}
		/>
	);
}
