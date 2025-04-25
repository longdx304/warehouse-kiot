import { FC, ReactNode } from 'react';
import { Avatar as AntdAvatar, AvatarProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends AvatarProps {
	className?: string;
	children?: ReactNode;
}
const Avatar: FC<Props> = ({ className, children, ...props }) => {
	return (
		<AntdAvatar className={cn('', className)} {...props}>
			{children}
		</AntdAvatar>
	);
};

export default Avatar;
