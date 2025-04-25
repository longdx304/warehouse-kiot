'use client';
import { OrderEdit } from '@medusajs/medusa';
import useToggleState from '@/lib/hooks/use-toggle-state';

import { useAdminOrderEdits, useAdminCreateOrderEdit } from 'medusa-react';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { message } from 'antd';

type OrderEditContextType = {
	showModal: () => void;
	hideModal: () => void;
	isModalVisible: boolean;
	activeOrderEditId?: string | undefined;
	setActiveOrderEditId: (id: string | undefined) => void;
	orderEdits?: OrderEdit[];
};

const defaultOrderEditContext: OrderEditContextType = {
	showModal: () => {},
	hideModal: () => {},
	isModalVisible: false,
	activeOrderEditId: undefined,
	setActiveOrderEditId: () => {},
	orderEdits: undefined,
};

const OrderEditContext = React.createContext(defaultOrderEditContext);

type OrderEditProviderProps = PropsWithChildren<{ orderId: string }>;

export const OrderEditProvider = ({
	children,
	orderId,
}: OrderEditProviderProps) => {
	const {
		state: isModalVisible,
		onOpen,
		onClose: hideModal,
	} = useToggleState(false);
	const [activeOrderEditId, setActiveOrderEditId] = useState<
		string | undefined
	>(undefined);

	const { order_edits } = useAdminOrderEdits({
		order_id: orderId,
		// limit: count, // TODO
	});
	const { mutateAsync: createOrderEdit } = useAdminCreateOrderEdit();

	const handleOpenModal = async () => {
		await createOrderEdit({ order_id: orderId })
			.then(({ order_edit }) => {
				setActiveOrderEditId(order_edit.id);
			})
			.catch(() => {
				message.error(
					'Đã có một chỉnh sửa đơn hàng đang hoạt động trên đơn hàng này'
				);
				hideModal();
			});
		onOpen();
		// .finally(() => (isRequestRunningFlag = false));
	};


	return (
		<OrderEditContext.Provider
			value={{
				showModal: handleOpenModal,
				hideModal,
				isModalVisible,
				activeOrderEditId,
				setActiveOrderEditId,
				orderEdits: order_edits,
			}}
		>
			{children}
		</OrderEditContext.Provider>
	);
};

export const useOrderEdit = () => {
	const context = useContext(OrderEditContext);
	if (context === undefined) {
		throw new Error('useOrderEdit must be used within a OrderEditProvider');
	}
	return context;
};
