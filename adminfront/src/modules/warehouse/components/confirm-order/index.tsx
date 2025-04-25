import { Modal } from '@/components/Modal';
import React from 'react';

type Props = {
	state: boolean;
	title: string;
	children?: React.ReactNode;
	handleOk: () => void;
	handleCancel: () => void;
	isLoading?: boolean;
};
const ConfirmOrder: React.FC<Props> = ({
	state,
	title,
	children,
	handleOk,
	handleCancel,
	isLoading,
}) => {
	return (
		<Modal
			open={state}
			title={title}
			width={600}
			handleOk={handleOk}
			handleCancel={handleCancel}
			isLoading={isLoading}
		>
			{children}
		</Modal>
	);
};

export default ConfirmOrder;
