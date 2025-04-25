import React from "react";
import Button from "./Button";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "antd";

interface Props extends BadgeProps {
	className?: string;
	icon?: React.ReactNode;
}

export default function BadgeButton({
	className,
	icon,
	children,
	...props
}: Props) {
	return (
		<Badge {...props}>
			<Button
				className={cn("leading-none", className)}
				icon={icon}
				shape="circle"
				type="text"
			>
				{children}
			</Button>
		</Badge>
	);
}
