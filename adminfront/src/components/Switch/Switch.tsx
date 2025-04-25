import { Switch as AndtSwitch, SwitchProps } from 'antd';
import { cn } from '@/lib/utils';

export type Props = Partial<SwitchProps> & {
	className?: string;
};

export default function Switch({ className, ...props }: Props) {
	return (
		<AndtSwitch className={cn('', className)} {...props} />
	);
}
