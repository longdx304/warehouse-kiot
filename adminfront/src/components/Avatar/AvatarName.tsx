import { FC, ReactNode } from 'react';
import { Avatar as AntdAvatar, AvatarProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends AvatarProps {
	className?: string;
	children?: ReactNode;
	user?: {
		img?: string;
		first_name?: string;
		last_name?: string;
		email?: string;
	};
	font?: string;
	color?: string;
}
const AvatarName: FC<Props> = ({
	className,
	children,
	user,
	font = 'font-medium',
	color = 'bg-gray-800',
	...props
}) => {
	let username: string;

	if (user?.first_name && user?.last_name) {
		username = user.first_name + ' ' + user.last_name;
	} else if (user?.email) {
		username = user.email;
	} else {
		username = 'No name';
	}
	return (
		<AntdAvatar className={cn('text-sm font-semibold', className)} {...props}>
			{username.slice(0, 1).toUpperCase()}
		</AntdAvatar>
	);
};

export default AvatarName;
