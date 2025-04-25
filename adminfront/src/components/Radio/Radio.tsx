import { Radio as AntdRadio, RadioProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends RadioProps {
	className?: string;
	children?: React.ReactNode;
}

export default function Radio({ className, children, ...props }: Props) {
	return (
		<AntdRadio className={cn('w-full', className)} {...props}>
			{children}
		</AntdRadio>
	);
}
