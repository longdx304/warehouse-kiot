import { Empty as AntdEmpty, EmptyProps } from 'antd';
import { cn } from '@/lib/utils';
import { Flex } from '@/components/Flex';
import { ErrorText } from '@/components/Typography';

interface Props extends EmptyProps {
	className?: string;
}

export default function Empty({ className, ...props }: Props) {
	return <AntdEmpty className={cn('', className)} {...props} />;
}
