import { cn } from '@/lib/utils';
import { Typography, TypographyProps } from 'antd';
import { TextProps } from 'antd/es/typography/Text';
import { ReactNode } from 'react';
import { Tooltip } from '../Tooltip';

type Props = TextProps & {
	className?: string;
	children?: ReactNode | string | number;
	strong?: boolean;
	tooltip?: boolean;
	classNameText?: string;
};

const { Text: AntdText } = Typography;

export default function Text({
	className,
	strong,
	tooltip = false,
	children,
	classNameText,
	...props
}: Props) {
	const strongText = strong ? 'font-semibold' : '';
	const tooltipText = typeof ['string', 'number'].includes(typeof children) ? (
		<span className={classNameText || className}>{children}</span>
	) : (
		''
	);
	return (
		<AntdText className={cn('m-0', strongText)} {...props}>
			<Tooltip title={tooltip && tooltipText}>{tooltipText}</Tooltip>
		</AntdText>
	);
}
