import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Text } from '@/components/Typography';
import { queryClient } from '@/lib/constants/query-client';
import { ADMIN_LINEITEM } from '@/lib/hooks/api/line-item';
import { ADMIN_PRODUCT_INBOUND, useAdminCreateWarehouseAndInventory } from '@/lib/hooks/api/product-inbound';
import {
	useAdminWarehouseInventoryByVariant,
	useAdminWarehouses,
} from '@/lib/hooks/api/warehouse';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { getErrorMessage } from '@/lib/utils';
import VariantInventoryForm from '@/modules/warehouse/components/variant-inventory-form';
import { LineItem } from '@/types/lineItem';
import { AdminPostItemData, Warehouse } from '@/types/warehouse';
import { Col, message, Row } from 'antd';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import WarehouseItem from './warehouse-item';

type WarehouseFormProps = {
	variantId: string;
	lineItem: LineItem & {
		supplier_order_id: string;
	};
	isPermission: boolean;
};

type ValueType = {
	key?: string;
	label: string;
	value: string;
};

const WarehouseForm = ({
	variantId,
	lineItem,
	isPermission,
}: WarehouseFormProps) => {
	// state
	const { getSelectedUnitData, onReset } = useProductUnit();
	const [searchValue, setSearchValue] = useState<ValueType | null>(null);
	const { state: isModalOpen, onOpen, onClose } = useToggleState(false);

	// fetch hook api
	const {
		warehouse,
		isLoading: warehouseLoading,
		refetch: refetchWarehouse,
	} = useAdminWarehouses({
		q: searchValue?.label || undefined,
	});

	const addWarehouse = useAdminCreateWarehouseAndInventory();

	const {
		warehouseInventory,
		isLoading: warehouseInventoryLoading,
		refetch: refetchInventory,
	} = useAdminWarehouseInventoryByVariant(variantId);
	const unitData = getSelectedUnitData();

	// Debounce fetcher
	const debounceFetcher = debounce((value: string) => {
		if (!value.trim()) {
			return;
		}
		setSearchValue({
			label: value,
			value: '',
		});
	}, 800);

	// Format options warehouse
	const optionWarehouses = useMemo(() => {
		if (!warehouse) return [];
		return warehouse.map((warehouse: Warehouse) => ({
			label: warehouse.location,
			value: warehouse.id,
		}));
	}, [warehouse]);

	const handleAddLocation = () => {
		if (!searchValue) return;

		onOpen();
	};

	const handleSelect = async (data: ValueType) => {
		const { label, value } = data as ValueType;
		if (!value || !label) return;

		setSearchValue({
			label,
			value,
		});
		onOpen();
	};

	const handleOkModal = async () => {
		if (!searchValue) return;

		if (!unitData) {
			return message.error('Vui lòng chọn loại hàng và số lượng');
		}
		const warehouse_quantity = lineItem.warehouse_quantity ?? 0;
		if (unitData.totalQuantity > lineItem.quantity - warehouse_quantity) {
			return message.error(
				`Tổng số lượng nhập vào không được lớn hơn số lượng giao (${lineItem.quantity} đôi)`
			);
		}
		const itemData: AdminPostItemData = {
			variant_id: variantId,
			quantity: unitData?.quantity ?? 0,
			unit_id: unitData?.unitId ?? '',
			line_item_id: lineItem.id,
			order_id: lineItem.supplier_order_id,
			type: 'INBOUND',
		};

		if (!itemData) return;

		const payload = {
			warehouse: {
				warehouse_id: searchValue?.value ?? undefined,
				location: searchValue.label,
				variant_id: variantId,
				unit_id: unitData?.unitId,
			},
			itemInventory: itemData,
		};

		// clear state to refetch warehouse
		setSearchValue({
			label: '',
			value: '',
		});

		await addWarehouse.mutateAsync(payload, {
			onSuccess: () => {
				message.success('Thêm vị trí cho sản phẩm thành công');
				refetchWarehouse();
				refetchInventory();
				queryClient.invalidateQueries([ADMIN_LINEITEM, 'detail']);
				queryClient.invalidateQueries([ADMIN_PRODUCT_INBOUND, 'detail']);

				onReset();
				onClose();
			},
			onError: (error: any) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	return (
		<Card
			className="mt-2 shadow-none border-[1px] border-solid border-gray-300 rounded-[6px]"
			rounded
			loading={warehouseInventoryLoading}
		>
			<Flex vertical gap={6}>
				<Text strong className="">
					Vị trí sản phẩm trong kho
				</Text>
				{warehouseInventory?.length === 0 && (
					<Text className="text-gray-500">
						Sản phẩm chưa có vị trí ở trong kho
					</Text>
				)}
				<Row gutter={[8, 8]}>
					{warehouseInventory?.map((item: any) => (
						<Col xs={24} sm={12} key={item.id}>
							<WarehouseItem
								item={item}
								lineItem={lineItem as any}
								refetchInventory={refetchInventory}
								isPermission={isPermission}
							/>
						</Col>
					))}
				</Row>
			</Flex>
			{isPermission && (
				<Flex vertical gap={6} className="mt-2">
					<Text strong className="">
						Tìm & thêm vị trí mới
					</Text>
					<Flex gap={4}>
						<Select
							className="flex-grow"
							placeholder="Chọn vị trí"
							allowClear
							options={optionWarehouses}
							labelInValue
							autoClearSearchValue={false}
							filterOption={false}
							value={!isEmpty(searchValue) ? searchValue : undefined}
							onSearch={debounceFetcher}
							onSelect={handleSelect}
							showSearch
							dropdownRender={(menu) => (
								<div>
									{menu}
									{!isEmpty(searchValue) && (
										<div className="flex items-center justify-start p-2">
											<Text className="text-gray-300 cursor-pointer">
												Chọn thêm để tạo vị trí mới
											</Text>
										</div>
									)}
								</div>
							)}
							notFoundContent={
								warehouseLoading ? (
									<LoaderCircle
										className="animate-spin w-full flex justify-center"
										size={18}
										strokeWidth={3}
									/>
								) : (
									'Không tìm thấy vị trí'
								)
							}
						/>
						<Button
							className="w-fit h-[10]"
							onClick={handleAddLocation}
							disabled={isEmpty(searchValue?.label)}
						>
							Thêm
						</Button>
					</Flex>
					{/* modal */}
					<Modal
						open={isModalOpen}
						handleCancel={() => {
							onReset();
							onClose();
							setSearchValue({
								label: '',
								value: '',
							});
						}}
						handleOk={handleOkModal}
						title={`Thao tác tại vị trí ${searchValue?.label}`}
						isLoading={addWarehouse.isLoading}
					>
						<VariantInventoryForm type="INBOUND" />
					</Modal>
				</Flex>
			)}
		</Card>
	);
};

export default WarehouseForm;
