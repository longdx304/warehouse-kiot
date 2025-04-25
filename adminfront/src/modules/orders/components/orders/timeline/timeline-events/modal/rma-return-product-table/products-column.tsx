import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { ProductVariant } from '@medusajs/medusa';

import { Flex } from '@/components/Flex';
import { Button } from '@/components/Button';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatAmountWithSymbol } from '@/utils/prices';
import { clsx } from 'clsx';
import { Plus, Minus } from 'lucide-react';

interface Props {
	order: any;
	handleToAddQuantity: (value: number, itemId: string) => void;
	handleRemoveItem: (itemId: string) => void;
}

type SelectProduct = Omit<
	ProductVariant & { quantity: number },
	'beforeInsert'
>;

const extractPrice = (prices: any, order: any) => {
	let price = prices.find((ma: any) => ma?.region_id === order?.region_id);

	if (!price) {
		price = prices.find(
			(ma: any) => ma?.currency_code === order?.currency_code
		);
	}

	if (price) {
		return formatAmountWithSymbol({
			currency: order.currency_code,
			amount: price.amount * (1 + order.tax_rate / 100),
		});
	}

	return 0;
};

const productsColumns = ({
	order,
	handleRemoveItem,
	handleToAddQuantity,
}: Props) => [
	{
		title: 'Chi tiết sản phẩm',
		key: 'product',
		dataIndex: 'product',
		// width: 150,
		className: 'text-xs',
		fixed: 'left',
		render: (_: SelectProduct['product'], record: SelectProduct) => (
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
		title: 'Số lượng',
		key: 'quantity',
		dataIndex: 'quantity',
		className: 'text-xs',
		editable: true,
		render: (_: number, record: SelectProduct) => {
			// return _;
			return (
				<div className="text-gray-500 flex w-full justify-start text-right">
					<span
						onClick={() => handleToAddQuantity(-1, record.id)}
						className="hover:bg-gray-200 mr-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md"
					>
						<Minus size={16} strokeWidth={2} />
					</span>
					<span>{_ || 0}</span>
					<span
						onClick={() => handleToAddQuantity(1, record.id)}
						className={clsx(
							'hover:bg-gray-200 ml-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md'
						)}
					>
						<Plus size={16} />
					</span>
				</div>
			);
		},
	},
	{
		title: 'Giá tiền',
		key: 'prices',
		dataIndex: 'prices',
		className: 'text-xs',
		render: (_: SelectProduct['prices']) => {
			return extractPrice(_, order);
		},
	},
	{
		key: 'id',
		dataIndex: 'id',
		width: 40,
		render: (_: SelectProduct['id'], record: SelectProduct) => {
			return (
				<Flex>
					<Button
						onClick={() => handleRemoveItem(_ as string)}
						type="text"
						shape="circle"
						icon={<Trash2 size={20} color="#d3d3d3" />}
					/>
				</Flex>
			);
		},
	},
];

export default productsColumns;
