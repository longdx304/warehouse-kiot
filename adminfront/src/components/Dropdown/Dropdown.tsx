import { cn } from '@/lib/utils';
import { Dropdown as AndtDropdown, DropDownProps } from 'antd';

export type Props = Partial<DropDownProps> & {
	className?: string;
};

export default function Dropdown({ className, children, ...props }: Props) {
	return (
		<AndtDropdown className={cn('', className)} {...props}>
			{children}
		</AndtDropdown>
	);
}
