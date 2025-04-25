import { Modal } from '@/components/Modal';
import {
	useAdminAddInventoryToWarehouse,
	useAdminRemoveInventoryToWarehouse,
} from '@/lib/hooks/api/warehouse';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { getErrorMessage } from '@/lib/utils';
import VariantInventoryForm from '@/modules/warehouse/components/variant-inventory-form';
import { WarehouseInventory } from '@/types/warehouse';
import { message } from 'antd';
import { FC } from 'react';

interface Props {
	isModalOpen: boolean;
	onClose: () => void;
	inventoryType: string;
	warehouseInventory: WarehouseInventory;
	refetch?: () => void;
}

const ModalVariantInventory: FC<Props> = ({
	isModalOpen,
	onClose,
	inventoryType,
	warehouseInventory,
	refetch = () => {},
}) => {
	const { getSelectedUnitData, onReset } = useProductUnit();
	const unitData = getSelectedUnitData();

	const title = inventoryType === 'INBOUND' ? 'Nhập hàng' : 'Xuất hàng';
	const addInventoryToWarehouse = useAdminAddInventoryToWarehouse();
	const removeInventoryToWarehouse = useAdminRemoveInventoryToWarehouse();

	const handleOkModal = async () => {
		if (!unitData) {
			return message.error('Vui lòng chọn loại hàng và số lượng');
		}

		if (inventoryType === 'INBOUND') {
			// onAddUnit();
			const itemData = {
				warehouse_id: warehouseInventory.warehouse_id,
				variant_id: warehouseInventory.variant_id,
				quantity: unitData.quantity,
				unit_id: unitData.unitId,
				warehouse_inventory_id: warehouseInventory.id,
				type: 'INBOUND',
			};

			onReset();
			await addInventoryToWarehouse.mutateAsync(itemData, {
				onSuccess: () => {
					refetch();
					message.success(`Đã nhập hàng thành công`);
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			});
		} else {
			const itemData = {
				warehouse_id: warehouseInventory.warehouse_id,
				variant_id: warehouseInventory.variant_id,
				quantity: unitData.quantity,
				unit_id: unitData.unitId,
				warehouse_inventory_id: warehouseInventory.id,
				type: 'OUTBOUND',
			};

			onReset();
			await removeInventoryToWarehouse.mutateAsync(itemData, {
				onSuccess: () => {
					refetch();
					message.success(`Đã xuất hàng thành công`);
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			});
		}
		onClose();
	};

	return (
		<Modal
			open={isModalOpen}
			handleCancel={() => {
				onClose();
			}}
			handleOk={handleOkModal}
			title={title}
			isLoading={
				addInventoryToWarehouse.isLoading ||
				removeInventoryToWarehouse.isLoading
			}
		>
			<VariantInventoryForm
				type={inventoryType as 'INBOUND' | 'OUTBOUND'}
				maxQuantity={
					inventoryType === 'OUTBOUND'
						? warehouseInventory.quantity /
						  warehouseInventory.item_unit.quantity
						: undefined
				}
			/>
		</Modal>
	);
};

export default ModalVariantInventory;
