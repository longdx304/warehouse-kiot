import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatAmountWithSymbol } from '@/utils/prices';
import { ProductVariant } from '@medusajs/medusa';
import { InputNumber, Popover, Radio, RadioChangeEvent, Space } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
	currency: string | undefined;
	getQuantity: (variantId: string) => number;
	handleQuantityChange: (value: number, variantId: string) => void;
	getPrice: (variantId: string) => number;
	handlePriceChange: (
		variantId: string,
		value: number,
		currency: string
	) => void;
}

type SelectProduct = Omit<
	ProductVariant & { quantity?: number; unit_price?: number },
	'beforeInsert'
>;

enum Unit {
	Đôi = 'đôi',
	Giỏ = 'giỏ',
}

const EditableQuantity = ({
	quantity,
	record,
	handleQuantityChange,
}: {
	quantity: number;
	record: SelectProduct;
	handleQuantityChange: (value: number, variantId: string) => void;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState<Unit>(Unit.Đôi);
	const [inputValue, setInputValue] = useState<number>(quantity || 1);

	// Convert quantity to appropriate unit when unit changes
	const handleUnitChange = (e: RadioChangeEvent) => {
		const newUnit = e.target.value as Unit;
		setSelectedUnit(newUnit);

		// Convert current inputValue to the new unit
		if (newUnit === Unit.Giỏ && selectedUnit === Unit.Đôi) {
			setInputValue(Math.floor(inputValue / 24));
		} else if (newUnit === Unit.Đôi && selectedUnit === Unit.Giỏ) {
			setInputValue(inputValue * 24);
		}
	};

	const handleValueChange = (value: number | null) => {
		if (value !== null) {
			const maxInCurrentUnit =
				selectedUnit === Unit.Đôi
					? record.inventory_quantity
					: Math.floor(record.inventory_quantity / 24);

			const finalInputValue = Math.min(
				value,
				!record.allow_backorder ? maxInCurrentUnit : Number.MAX_SAFE_INTEGER
			);
			setInputValue(finalInputValue);

			// Convert to đôi before sending to parent
			const finalQuantity =
				selectedUnit === Unit.Giỏ ? finalInputValue * 24 : finalInputValue;
			handleQuantityChange(finalQuantity, record?.id as string);
		}
	};

	// Update inputValue when quantity prop changes
	useEffect(() => {
		const newValue = quantity || 1;
		setInputValue(
			selectedUnit === Unit.Giỏ ? Math.floor(newValue / 24) : newValue
		);
	}, [quantity, selectedUnit]);

	const popoverContent = (
		<Space direction="vertical" className="w-full">
			<Radio.Group value={selectedUnit} onChange={handleUnitChange}>
				<Space direction="vertical">
					<Radio value={Unit.Đôi}>Đôi</Radio>
					<Radio value={Unit.Giỏ}>Giỏ (1 giỏ = 24 đôi)</Radio>
				</Space>
			</Radio.Group>
			<InputNumber
				autoFocus
				min={1}
				max={
					!record.allow_backorder
						? selectedUnit === Unit.Đôi
							? record.inventory_quantity
							: Math.floor(record.inventory_quantity / 24)
						: Number.MAX_SAFE_INTEGER
				}
				value={inputValue}
				onChange={handleValueChange}
				onBlur={() => setIsEditing(false)}
				onPressEnter={() => setIsEditing(false)}
				className="w-full"
			/>
		</Space>
	);

	return (
		<Popover
			content={popoverContent}
			trigger="click"
			open={isEditing}
			onOpenChange={setIsEditing}
		>
			<Text className="text-right text-gray-500 cursor-pointer">
				{quantity || 1}
			</Text>
		</Popover>
	);
};

const EditablePrice = ({
	unitPrice,
	record,
	handlePriceChange,
	currency,
}: {
	currency: string | undefined;
	unitPrice: number;
	record: SelectProduct;
	handlePriceChange: (
		variantId: string,
		value: number,
		currency: string
	) => void;
}) => {
	const [isEditing, setIsEditing] = useState(false);

	return isEditing ? (
		<InputNumber
			autoFocus
			min={1}
			defaultValue={unitPrice || 1}
			onBlur={() => setIsEditing(false)}
			onPressEnter={() => setIsEditing(false)}
			onChange={(value) => {
				if (value !== null) {
					handlePriceChange(record?.id, +value, currency || 'vnd');
				}
			}}
			className="w-20"
		/>
	) : (
		<Text
			className="text-right text-gray-500 cursor-pointer"
			onClick={() => setIsEditing(true)}
		>
			{formatAmountWithSymbol({
				amount: unitPrice,
				currency: currency || 'vnd',
			})}
		</Text>
	);
};

const productsColumns = ({
	currency,
	getQuantity,
	handleQuantityChange,
	getPrice,
	handlePriceChange,
}: Props) => {
	return [
		{
			title: 'Tên sản phẩm',
			key: 'product',
			dataIndex: 'product',
			className: 'text-xs',
			fixed: 'left',
			render: (_: any, record: ProductVariant) => {
				const variantImages = _?.metadata?.variant_images
					? JSON.parse(_?.metadata?.variant_images)
					: [];

				const variantImage = variantImages.find(
					(image: any) => image.variant_value === record.title
				);

				const thumbnail = variantImage?.image_url
					? variantImage?.image_url
					: _?.thumbnail ?? '/images/product-img.png';

				return (
					<Flex className="flex items-center gap-3">
						<Image
							src={thumbnail}
							alt="Product variant Thumbnail"
							width={30}
							height={40}
							className="rounded-md cursor-pointer"
						/>
						<Flex vertical className="">
							<Tooltip title={_?.title ?? ''}>
								<Text className="text-xs line-clamp-2">{_?.title ?? ''}</Text>
							</Tooltip>
							<span className="text-gray-500">{record?.title ?? ''}</span>
						</Flex>
					</Flex>
				);
			},
		},
		{
			title: 'Số lượng',
			key: 'quantity',
			dataIndex: 'quantity',
			className: 'text-xs',
			width: 100,

			render: (_: any, record: SelectProduct) => {
				return (
					<EditableQuantity
						quantity={getQuantity(record?.id as string)}
						record={record}
						handleQuantityChange={handleQuantityChange}
					/>
				);
			},
		},
		{
			title: 'Giá tiền',
			key: 'unit_price',
			dataIndex: 'unit_price',
			className: 'text-xs text-center',
			render: (_: any, record: SelectProduct) => {
				return (
					<EditablePrice
						unitPrice={getPrice(record?.id as string)}
						record={record}
						handlePriceChange={handlePriceChange}
						currency={currency}
					/>
				);
			},
		},
		{
			title: 'Còn hàng',
			key: 'inventory_quantity',
			dataIndex: 'inventory_quantity',
			className: 'text-xs',
			render: (
				_: ProductVariant['inventory_quantity'],
				record: ProductVariant
			) => {
				return _;
			},
		},
	];
};

export default productsColumns;
