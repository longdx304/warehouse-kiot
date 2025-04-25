import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';

import { cn } from '@/lib/utils';

interface Props extends AntdInputProps {
	className?: string;
}

export default function InputPassword({ className, ...props }: Props) {
	return (
		<AntdInput.Password size="large" className={cn('p-3 gap-2', className)} {...props} />
	);
}
