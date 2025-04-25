import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Text } from '@/components/Typography';
import { useAdminCreateWarehouseVariant } from '@/lib/hooks/api/warehouse';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { getErrorMessage } from '@/lib/utils';
import VariantInventoryForm from '@/modules/warehouse/components/variant-inventory-form';
import { Warehouse } from '@/types/warehouse';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { message } from 'antd';
import { debounce, isEmpty } from 'lodash';
import { LoaderCircle } from 'lucide-react';
import { useAdminVariants } from 'medusa-react';
import { FC, useMemo, useState } from 'react';

interface Props {
	isModalOpen: boolean;
	onClose: () => void;
	warehouse: Warehouse;
}
type ValueType = {
	key?: string;
	label: string;
	value: string;
};
const ModalAddVariantWarehouse: FC<Props> = ({
	isModalOpen,
	onClose,
	warehouse,
}) => {
	const [searchValue, setSearchValue] = useState<ValueType | undefined>();
	const [variantValue, setVariantValue] = useState<string | undefined>();
	const { getSelectedUnitData, onReset } = useProductUnit();
	const unitData = getSelectedUnitData();
	const addWarehouseVariant = useAdminCreateWarehouseVariant();

	const { variants, isLoading } = useAdminVariants({
		limit: 20,
		q: searchValue?.label,
	});

	// Debounce fetcher
	const debounceFetcher = debounce((value: string) => {
		setSearchValue({
			label: value,
			value: '',
		});
	}, 800);

	// Format options warehouse
	const optionVaraint = useMemo(() => {
		if (!variants) return [];
		return variants.map((variant: PricedVariant) => ({
			label: `${variant.product?.title} - ${variant.title} ${
				variant?.sku ? `(${variant.sku})` : ''
			}`,
			value: variant.id,
		}));
	}, [variants]);

	const handleSelect = async (data: ValueType) => {
		const { label, value } = data as ValueType;
		if (!value || !label) return;

		// setSearchValue(data);
		setVariantValue(value);
	};

	const handleOkModal = async () => {
		if (!variantValue) {
			return message.error('Vui lòng nhập tên vị trí kho');
		}
		if (!unitData) {
			return message.error('Vui lòng chọn loại hàng và số lượng');
		}

		await addWarehouseVariant.mutateAsync(
			{
				location: warehouse.location,
				variant_id: variantValue,
				warehouse_id: warehouse.id,
				quantity: unitData.quantity,
				unit_id: unitData.unitId,
				type: 'INBOUND',
			},
			{
				onSuccess: () => {
					message.success(`Đã thêm sản phẩm vào kho thành công`);
					setSearchValue(undefined);
					setVariantValue(undefined);
					onReset();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
		onClose();
	};

	return (
		<Modal
			open={isModalOpen}
			handleCancel={() => {
				onReset();
				setSearchValue(undefined);
				setVariantValue(undefined);
				onClose();
			}}
			handleOk={handleOkModal}
			title={`Thêm sản phẩm vào ${warehouse.location}`}
			isLoading={addWarehouseVariant.isLoading}
		>
			<Flex vertical align="flex-start" className="w-full mb-2">
				<Text className="text-[14px] text-gray-500">
					Tên biến thể sản phẩm:
				</Text>
				<Select
					className="w-full"
					placeholder="Chọn biến thể sản phẩm"
					allowClear
					options={optionVaraint}
					labelInValue
					autoClearSearchValue={false}
					filterOption={false}
					value={!isEmpty(variantValue) ? variantValue : undefined}
					onSearch={debounceFetcher}
					onSelect={handleSelect}
					showSearch
					notFoundContent={
						isLoading ? (
							<LoaderCircle
								className="animate-spin w-full flex justify-center"
								size={18}
								strokeWidth={3}
							/>
						) : (
							'Không tìm thấy biến thể sản phẩm'
						)
					}
				/>
			</Flex>
			<VariantInventoryForm type={'INBOUND'} />
		</Modal>
	);
};

export default ModalAddVariantWarehouse;
