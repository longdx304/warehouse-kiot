import { ProductVariant } from '@medusajs/medusa';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import { InputNumber } from '@/components/Input';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { useState } from 'react';
import { ItemPrice, ItemQuantity } from '../index';

interface Props {
	itemQuantities: ItemQuantity[];
	handleQuantityChange: (value: number, variantId: string) => void;
	itemPrices: ItemPrice[];
	handlePriceChange: (value: number, variantId: string) => void;
}

const EditableQuantity = ({
	quantity,
	record,
	handleQuantityChange,
}: {
	quantity: number;
	record: any;
	handleQuantityChange: (value: number, variantId: string) => void;
}) => {
	const [isEditing, setIsEditing] = useState(false);

	return isEditing ? (
		<InputNumber
			autoFocus
			min={1}
			defaultValue={quantity || 1}
			onBlur={() => setIsEditing(false)}
			onPressEnter={() => setIsEditing(false)}
			onChange={(value) => {
				if (value !== null) {
					handleQuantityChange(value as number, record?.id as string);
				}
			}}
			className="w-full text-center"
		/>
	) : (
		<Text
			className="block w-full text-gray-500 cursor-pointer"
			onClick={() => setIsEditing(true)}
		>
			{quantity || 1}
		</Text>
	);
};
const productColumns = ({
	itemQuantities,
	itemPrices,
	handlePriceChange,
	handleQuantityChange,
}: Props) => [
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
						// src={_?.thumbnail ?? '/images/product-img.png'}
						src={thumbnail}
						alt="Product variant Thumbnail"
						width={30}
						height={40}
						className="rounded-md cursor-pointer"
					/>
					<Flex vertical className="">
						<Tooltip title={_.title || ''}>
							<Text className="text-xs line-clamp-2">{_.title || ''}</Text>
						</Tooltip>
						<span className="text-gray-500">{record.title || ''}</span>
					</Flex>
				</Flex>
			);
		},
	},
	{
		title: 'Số lượng',
		key: 'quantity',
		dataIndex: 'quantity',
		className: 'text-xs text-center [&>div]:flex [&>div]:items-center',
		fixed: 'right',
		editable: true,
		render: (_: number, record: any) => {
			const itemQuantity = itemQuantities.find(
				(item) => item.variantId === record.id
			);
			const defaultQuantity = itemQuantity ? itemQuantity.quantity : 1;
			return (
				<InputNumber
					min={1}
					defaultValue={defaultQuantity}
					onChange={(value) => {
						if (value !== null) {
							handleQuantityChange(value as number, record?.id as string);
						}
					}}
					className="w-1/2 flex text-center justify-center"
				/>
			);
		},
	},
	{
		title: 'Giá tiền',
		key: 'price_from_supplier',
		dataIndex: 'price_from_supplier',
		className: 'text-xs text-center',
		width: 250,
		render: (_: any, record: any) => {
			const itemPrice = itemPrices.find((item) => item.variantId === record.id);
			const price = itemPrice ? itemPrice.unit_price : record.supplier_price;

			return (
				<div className="flex items-center justify-start gap-2">
					<InputNumber
						className="w-full"
						value={price}
						min={0}
						formatter={(value) =>
							`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						}
						parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
						onChange={(value) => handlePriceChange(value as number, record.id)}
					/>
				</div>
			);
		},
	},
];

export default productColumns;
