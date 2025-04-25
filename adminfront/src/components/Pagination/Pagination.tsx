import { Pagination as AntdPagination, PaginationProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends PaginationProps {
	className?: string;
}

export default function Pagination({ className, ...props }: Props) {
	return (
		<AntdPagination className={cn('', className)} {...props} />
	);
}
