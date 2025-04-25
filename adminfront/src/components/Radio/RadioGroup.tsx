import { Radio as AntdRadio, RadioProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends RadioProps {
	className?: string;
	children?: React.ReactNode;
}

export default function RadioGroup({ className, children, ...props }: Props) {
	return (
		<AntdRadio.Group className={cn('w-full', className)} {...props}>
			{children}
		</AntdRadio.Group>
	);
}
