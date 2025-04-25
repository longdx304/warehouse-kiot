import { cn } from '@/lib/utils';
import { Modal as AntdModal, ModalProps } from 'antd';
import { ReactNode } from 'react';

import { Button } from '@/components/Button';

interface Props extends ModalProps {
	className?: string;
	children?: ReactNode;
	handleCancel: () => void;
	handleOk: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	footer?: React.ReactNode;
	id?: string;
}

export default function Modal({
	className,
	handleOk,
	handleCancel,
	isLoading,
	children,
	disabled = false,
	footer = null,
	id,
	...props
}: Props) {
	const renderFooter = () => {
		if (footer) return footer;
		return [
			<Button
				key="1"
				type="default"
				danger
				onClick={handleCancel}
				loading={isLoading}
			>
				Huỷ
			</Button>,
			<Button
				key="submit"
				onClick={handleOk}
				loading={isLoading}
				disabled={disabled}
				data-testid="submitButton"
			>
				Xác nhận
			</Button>,
		];
	};

	return (
		<AntdModal
			className={cn('', className)}
			onCancel={handleCancel}
			footer={renderFooter()}
			styles={{
				body: {
					overflowY: 'auto',
					maxHeight: 'calc(100vh - 250px)',
					margin: '0 0',
				},
			}}
			{...props}
		>
			{children}
		</AntdModal>
	);
}
