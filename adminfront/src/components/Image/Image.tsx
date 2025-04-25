import { FC, ReactNode } from 'react';
import { Image as AntdImage, ImageProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends ImageProps {
	className?: string;
	children?: ReactNode;
}
const Image: FC<Props> = ({ className, children, ...props }) => {
	return (
		<AntdImage className={cn('', className)} {...props}>
			{children}
		</AntdImage>
	);
};

export default Image;
