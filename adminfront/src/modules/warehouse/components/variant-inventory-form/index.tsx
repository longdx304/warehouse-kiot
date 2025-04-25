import { Flex } from '@/components/Flex';
import { InputNumber } from '@/components/Input';
import { Select } from '@/components/Select';
import { Text } from '@/components/Typography';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { InputNumberProps } from 'antd';

type Props = {
	type: 'INBOUND' | 'OUTBOUND';
	maxQuantity?: number;
};

const VariantInventoryForm = ({
	type,
	maxQuantity = Number.MAX_SAFE_INTEGER,
}: Props) => {
	const {
		optionItemUnits,
		defaultUnit,
		selectedUnit,
		quantity,
		setSelectedUnit,
		setQuantity,
		item_units,
	} = useProductUnit();

	const handleUnitChange = (value: string) => {
		setSelectedUnit(value);
	};

	const handleQuantityChange: InputNumberProps['onChange'] = (value) => {
		if (value && /^\d*$/.test(value.toString())) {
			setQuantity(parseInt(value.toString()) || 0);
		}
	};

	return (
		<Flex gap="small" vertical>
			<Flex vertical align="flex-start">
				<Text className="text-[14px] text-gray-500">Loại hàng:</Text>
				<Select
					className="w-full"
					options={optionItemUnits}
					value={selectedUnit || defaultUnit}
					onChange={handleUnitChange}
					disabled={type === 'OUTBOUND'}
				/>
			</Flex>
			<Flex vertical align="flex-start">
				<Text className="text-[14px] text-gray-500">Số lượng:</Text>
				<InputNumber
					className="w-full"
					max={maxQuantity}
					min={0}
					value={quantity}
					onChange={handleQuantityChange}
				/>
			</Flex>
		</Flex>
	);
};

export default VariantInventoryForm;
