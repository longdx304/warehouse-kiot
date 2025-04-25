import React from 'react';
import { Skeleton as AntdSkeleton, SkeletonProps } from 'antd';
import { cn } from '@/lib/utils';

interface Props extends SkeletonProps {
	className?: string;
}
const Skeleton: React.FC<Props> = ({ className, ...props }) => (
	<AntdSkeleton className={cn('', className)} {...props} />
);

export default Skeleton;
