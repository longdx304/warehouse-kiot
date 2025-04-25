'use client';
import {
	useAdminCreateSupplierOrderEdit,
	useAdminSupplierOrderEdits,
} from '@/lib/hooks/api/supplier-order-edits';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { SupplierOrderEdit } from '@/types/supplier';
import { message } from 'antd';

import React, { PropsWithChildren, useContext, useState } from 'react';

type SupplierOrderEditContextType = {
	showModal: () => void;
	hideModal: () => void;
	isModalVisible: boolean;
	activeOrderEditId?: string | undefined;
	setActiveOrderEditId: (id: string | undefined) => void;
	supplierOrderEdits?: SupplierOrderEdit[];
};

const defaultSupplierOrderEditContext: SupplierOrderEditContextType = {
	showModal: () => {},
	hideModal: () => {},
	isModalVisible: false,
	activeOrderEditId: undefined,
	setActiveOrderEditId: () => {},
	supplierOrderEdits: undefined,
};

const SupplierOrderEditContext = React.createContext(
	defaultSupplierOrderEditContext
);

type SupplierOrderEditProviderProps = PropsWithChildren<{
	supplierOrderId: string;
}>;

export const SupplierOrderEditProvider = ({
	children,
	supplierOrderId,
}: SupplierOrderEditProviderProps) => {
	const {
		state: isModalVisible,
		onOpen,
		onClose: hideModal,
	} = useToggleState(false);

	const [activeOrderEditId, setActiveOrderEditId] = useState<
		string | undefined
	>(undefined);

	const { edits } = useAdminSupplierOrderEdits({
		supplier_order_id: supplierOrderId,
		// limit: count, // TODO
	});

	const { mutateAsync: createOrderEdit } = useAdminCreateSupplierOrderEdit();

	const handleOpenModal = async () => {
		await createOrderEdit({ supplier_order_id: supplierOrderId })
			.then(({ order_edit }) => {
				setActiveOrderEditId(order_edit.id);
			})
			.catch(() => {
				message.error('Đã có một đơn hãng đang hoạt động trên đơn hãng không');
				hideModal();
			});
		onOpen();
	};

	return (
		<SupplierOrderEditContext.Provider
			value={{
				showModal: handleOpenModal,
				hideModal,
				isModalVisible,
				activeOrderEditId,
				setActiveOrderEditId,
				supplierOrderEdits: edits,
			}}
		>
			{children}
		</SupplierOrderEditContext.Provider>
	);
};

export const useSupplierOrderEdit = () => {
	const context = useContext(SupplierOrderEditContext);
	if (context === undefined) {
		throw new Error(
			'useSupplierOrderEdit must be used within a SupplierOrderEditProvider'
		);
	}
	return context;
};
