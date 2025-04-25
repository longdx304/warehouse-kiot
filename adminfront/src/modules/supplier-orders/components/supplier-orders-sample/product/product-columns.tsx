import { ProductVariant } from '@medusajs/medusa';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import { InputNumber } from '@/components/Input';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { ItemQuantity } from '../index';

interface Props {
	itemQuantities: ItemQuantity[];
	handleQuantityChange: (value: number, variantId: string) => void;
}

const productColumns = ({ itemQuantities, handleQuantityChange }: Props) => [
	{
		title: 'Tên sản phẩm',
		key: 'product',
		dataIndex: 'product',
		className: 'text-xs',
		fixed: 'left',
		render: (_: any, record: ProductVariant) => {
			return (
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
			);
		},
	},
	{
		title: 'Số lượng',
		key: 'quantity',
		dataIndex: 'quantity',
		className: 'text-xs text-center [&>div]:flex [&>div]:items-center',
		editable: true,
		fixed: 'center',
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
					className="w-1/2 text-center"
				/>
			);
		},
	},
];

export default productColumns;
