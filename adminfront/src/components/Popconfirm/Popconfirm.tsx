import { Popconfirm as AntdPopconfirm, PopconfirmProps } from 'antd';
import { ReactNode } from 'react';

interface Props extends PopconfirmProps {
	className?: string;
	children?: ReactNode;
	handleCancel: () => void;
	handleOk: () => void;
	isLoading?: boolean;
	open?: boolean;
	title: string | ReactNode;
	description: string | ReactNode;
}

export default function Popconfirm({
	className,
	handleOk,
	handleCancel,
	isLoading,
	children,
	open = false,
	title,
	description,
	...props
}: Props) {
	return (
		<AntdPopconfirm
			title={title}
			description={description}
			// open={open}
			onConfirm={handleOk}
			// okButtonProps={{ loading: isLoading }}
			onCancel={handleCancel}
			okText="Đồng ý"
			cancelText="Hủy"
			{...props}
		>
			{children}
		</AntdPopconfirm>
	);
}
