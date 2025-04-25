import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Popconfirm } from '@/components/Popconfirm';
import { Text } from '@/components/Typography';
import { ADMIN_LINEITEM } from '@/lib/hooks/api/line-item';
import { ADMIN_PRODUCT_OUTBOUND } from '@/lib/hooks/api/product-outbound';
import {
	useAdminCreateInventory,
	useAdminRemoveInventory,
} from '@/lib/hooks/api/warehouse';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { getErrorMessage } from '@/lib/utils';
import VariantInventoryForm from '@/modules/warehouse/components/variant-inventory-form';
import { LineItem } from '@/types/lineItem';
import {
	AdminPostCreateOutboundInventoryReq,
	AdminPostRemmoveInventoryReq,
	WarehouseInventory,
} from '@/types/warehouse';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { Minus, Plus } from 'lucide-react';

type UpdatedLineItem = LineItem & {
	supplier_order_id: string;
};
type WarehouseItemProps = {
	item: WarehouseInventory;
	lineItem: UpdatedLineItem;
	refetchInventory: () => void;
	isPermission: boolean;
};
const WarehouseItem = ({
	item,
	lineItem,
	refetchInventory,
	isPermission,
}: WarehouseItemProps) => {
	const { getSelectedUnitData, onReset, setSelectedUnit, setQuantity } =
		useProductUnit();
	const createOutboundInventory = useAdminCreateInventory();
	const removeOutboundInventory = useAdminRemoveInventory();
	const queryClient = useQueryClient();

	const unitData = getSelectedUnitData();

	const quantity =
		item?.quantity === 0
			? `0`
			: `${item?.quantity / item?.item_unit?.quantity} ${
					item?.item_unit?.unit
			  }`;

	const onRemoveInventory = async () => {
		if (!unitData) {
			return message.error('Vui lòng chọn loại hàng và số lượng');
		}

		const itemData: AdminPostRemmoveInventoryReq = {
			variant_id: item.variant_id,
			quantity: unitData.quantity,
			unit_id: unitData.unitId,
			line_item_id: lineItem.id,
			order_id: lineItem?.order_id ?? '',
			warehouse_inventory_id: item.id,
			warehouse_id: item.warehouse_id,
			type: 'OUTBOUND',
		};

		onReset();
		await removeOutboundInventory.mutateAsync(itemData, {
			onSuccess: () => {
				message.success(`Đã lấy hàng tại vị trí ${item.warehouse.location}`);
				refetchInventory();
				queryClient.invalidateQueries([ADMIN_PRODUCT_OUTBOUND, 'detail']);
				queryClient.invalidateQueries([ADMIN_LINEITEM, 'detail']);
			},
			onError: (error: any) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	const onAddInventory = async () => {
		if (!unitData) {
			return message.error('Vui lòng chọn loại hàng và số lượng');
		}
		const warehouse_quantity = lineItem.warehouse_quantity ?? 0;
		if (unitData.totalQuantity > warehouse_quantity) {
			return message.error(
				`Số lượng hàng nhập vào không được lớn hơn số lượng đã lấy (${warehouse_quantity} đôi) của đơn hàng`
			);
		}
		const itemData: AdminPostCreateOutboundInventoryReq = {
			warehouse_id: item.warehouse_id,
			variant_id: item.variant_id,
			quantity: unitData.quantity,
			unit_id: unitData.unitId,
			line_item_id: lineItem.id,
			order_id: lineItem.order_id ?? '',
			warehouse_inventory_id: item.id,
			type: 'OUTBOUND',
		};

		onReset();
		await createOutboundInventory.mutateAsync(itemData, {
			onSuccess: () => {
				message.success(`Đã nhập hàng vào vị trí ${item.warehouse.location}`);
				refetchInventory();
				queryClient.invalidateQueries([ADMIN_PRODUCT_OUTBOUND, 'detail']);
				queryClient.invalidateQueries([ADMIN_LINEITEM, 'detail']);
			},
			onError: (error: any) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	return (
		<Flex
			align="center"
			gap="small"
			justify="space-between"
			className="border-solid border-[1px] border-gray-400 rounded-md py-2 bg-[#2F5CFF] hover:bg-[#3D74FF] cursor-pointer px-4"
		>
			{isPermission && (
				<Popconfirm
					title={`Lấy hàng tại vị trí (${item.warehouse.location})`}
					description={
						<VariantInventoryForm
							maxQuantity={item.quantity / item.item_unit.quantity}
							type="OUTBOUND"
						/>
					}
					isLoading={removeOutboundInventory.isLoading}
					cancelText="Huỷ"
					okText="Xác nhận"
					handleOk={onRemoveInventory}
					handleCancel={() => onReset()}
					icon={null}
				>
					<Button
						className="w-[24px] h-[24px] rounded-full"
						type="default"
						danger
						onClick={() => {
							item && item.item_unit && setSelectedUnit(item.item_unit.id);
							setQuantity(1);
						}}
						icon={<Minus size={16} />}
					/>
				</Popconfirm>
			)}
			<Text className="text-white">{`${quantity} (${item.warehouse.location})`}</Text>
			{isPermission && (
				<Popconfirm
					title={`Nhập hàng tại vị trí (${item.warehouse.location})`}
					description={<VariantInventoryForm type="INBOUND" />}
					isLoading={createOutboundInventory.isLoading}
					cancelText="Huỷ"
					okText="Xác nhận"
					handleOk={onAddInventory}
					handleCancel={() => onReset()}
					icon={null}
				>
					<Button
						className="w-[24px] h-[24px] rounded-full"
						color="primary"
						// variant="outlined"
						type="default"
						onClick={() => {
							item && item.item_unit && setSelectedUnit(item.item_unit.id);
							setQuantity(1);
						}}
						icon={<Plus size={16} />}
					/>
				</Popconfirm>
			)}
		</Flex>
	);
};

export default WarehouseItem;
