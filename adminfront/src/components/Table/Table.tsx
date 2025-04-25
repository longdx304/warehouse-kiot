import { Table as AntdTable, TableProps } from 'antd';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Props extends TableProps {
	className?: string;
	children?: ReactNode;
}

export default function Table({ className, children, ...props }: Props) {
	return (
		<AntdTable className={cn('w-full', className)} {...props}>
			{children}
		</AntdTable>
	);
}
