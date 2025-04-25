import { Collapse as AndtCollapse, CollapseProps } from 'antd';
import { cn } from '@/lib/utils';

export type Props = Partial<CollapseProps> & {
	className?: string;
};

export default function Collapse({ className, ...props }: Props) {
	return (
		<AndtCollapse className={cn('', className)} {...props} />
	);
}
