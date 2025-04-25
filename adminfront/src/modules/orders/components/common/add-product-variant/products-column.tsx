// @ts-nocheck
import { ProductVariant } from '@medusajs/medusa';
import Image from 'next/image';
import React from 'react';

import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatAmountWithSymbol } from '@/utils/prices';
import { InputNumber } from '@/components/Input';

interface Props {
	variantInventoryCell: (record: ProductVariant) => React.ReactNode;
	currencyCode: string;
	handlePriceChange: (variantId: string, price: number) => void;
}
const productsColumns = ({
	variantInventoryCell,
	currencyCode,
	handlePriceChange,
}: Props) => [
	{
		title: 'Tên sản phẩm',
		key: 'product',
		dataIndex: 'product',
		// width: 150,
		className: 'text-xs',
		fixed: 'left',
		render: (_: any, record: ProductVariant) => (
			<Flex className="flex items-center gap-3">
				<Image
					src={_?.thumbnail ?? '/images/product-img.png'}
					alt="Product variant Thumbnail"
					width={30}
					height={40}
					className="rounded-md cursor-pointer"
				/>
				<Flex vertical className="">
					<Tooltip title={_.title}>
						<Text className="text-xs line-clamp-2">{_.title}</Text>
					</Tooltip>
					<span className="text-gray-500">{record.title}</span>
				</Flex>
			</Flex>
		),
	},
	{
		title: 'Còn hàng',
		key: 'inventory_quantity',
		dataIndex: 'inventory_quantity',
		className: 'text-xs',
		render: (_: ProductVariant['ProductVariant'], record: ProductVariant) => {
			// const _render = variantInventoryCell(record);
			return _;
		},
	},
	{
		title: 'Giá tiền',
		key: 'original_price_incl_tax',
		dataIndex: 'original_price_incl_tax',
		className: 'text-xs',
		width: 250,
		render: (
			_: ProductVariant['original_price_incl_tax'],
			record: ProductVariant
		) => {
			if (!_) {
				return (
					<InputNumber
						onChange={(value) => handlePriceChange(record.id, value || 0)}
						className="w-1/2 text-center"
						value={record.calculated_price_incl_tax}
						min={1}
						max={999999999}
					/>
				);
			}

			return (
				<InputNumber
					onChange={(value) => handlePriceChange(record.id, value || 0)}
					className="w-1/2 text-center"
					value={record.calculated_price_incl_tax}
					min={1}
					max={999999999}
				/>
			);
		},
	},
];

export default productsColumns;
