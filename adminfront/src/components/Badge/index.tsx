import { Badge as AntBadge, BadgeProps } from 'antd';
import React from 'react';

interface Props extends BadgeProps {
	className?: string;
	icon?: React.ReactNode;
}

export default function Badge({ className, icon, children, ...props }: Props) {
	return <AntBadge {...props}>{children}</AntBadge>;
}
