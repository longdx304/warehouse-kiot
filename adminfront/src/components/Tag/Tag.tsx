import { cn } from '@/lib/utils';
import { Tag as AntdTag, TagProps } from 'antd';

interface Props extends TagProps {
	className?: string;
}

export default function Tag({ className, ...props }: Props) {
	return <AntdTag className={cn('', className)} {...props} />;
}
