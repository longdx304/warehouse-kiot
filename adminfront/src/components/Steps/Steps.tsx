import { Steps as AntdSteps, StepsProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends StepsProps {
	className?: string;
}

export default function Steps({ className, ...props }: Props) {
	return <AntdSteps className={cn('w-full', className)} {...props} />;
}
