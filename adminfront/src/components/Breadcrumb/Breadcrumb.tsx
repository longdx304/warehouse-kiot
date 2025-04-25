import { Breadcrumb as AntdBreadcrumb, BreadcrumbProps } from 'antd';
import { cn } from '@/lib/utils';
import { Flex } from '@/components/Flex';
import { ErrorText } from '@/components/Typography';

interface Props extends BreadcrumbProps {
	className?: string;
}

export default function Breadcrumb({ className, ...props }: Props) {
	return <AntdBreadcrumb className={cn('', className)} {...props} />;
}
