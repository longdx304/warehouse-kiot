import { Image as AntdImage, ImageProps } from 'antd';
import { FC, ReactNode } from 'react';

interface Props extends ImageProps {
	className?: string;
	children?: ReactNode;
}
const ImageGroup: FC<Props> = ({ className = '', children, ...props }) => {
	return <AntdImage.PreviewGroup {...props}>{children}</AntdImage.PreviewGroup>;
};

export default ImageGroup;
