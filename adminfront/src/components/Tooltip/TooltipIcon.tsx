import { Flex } from '@/components/Flex';
import { cn } from '@/lib/utils';
import { Tooltip as AntdTooltip, TooltipProps } from 'antd';

type Props = TooltipProps & {
	className?: string;
	title: string | React.ReactNode | any;
	icon: React.ReactNode;
	children?: React.ReactNode;
};

export default function TooltipIcon({
	title,
	className,
	icon,
	children,
	...props
}: Props) {
	return (
		<Flex gap="4px" align="center" className={cn('', className)}>
			{children}
			<AntdTooltip
				className="cursor-pointer [&_.ant-tooltip-inner]:!text-gray-500"
				color="white"
				title={title}
				{...props}
			>
				{icon}
			</AntdTooltip>
		</Flex>
	);
}
