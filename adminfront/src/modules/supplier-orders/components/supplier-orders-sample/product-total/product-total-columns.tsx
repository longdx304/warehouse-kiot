import { ProductVariant, Region } from '@medusajs/medusa';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import { Tag } from '@/components/Tag';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatNumber } from '@/lib/utils';
import { ItemQuantity } from '../index';

interface Props {
	itemQuantities: ItemQuantity[];
	currentPage: number;
}

const PAGE_SIZE = 10;
const productTotalColumns = ({
	itemQuantities,
	currentPage,
}: Props) => [
	{
		title: 'STT',
		key: 'id',
		width: 80,
		dataIndex: 'id',
		className: 'text-xs',
		render: (_: any, record: any, index: number) => {
			const calculatedIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
			return <Tag bordered={false}>{calculatedIndex}</Tag>;
		},
	},
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
						<Tooltip title={_?.title}>
							<Text className="text-xs line-clamp-2">{_?.title}</Text>
						</Tooltip>
						<span className="text-gray-500">{record?.title}</span>
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
		render: (_: number, record: any) => {
			const itemQuantity = itemQuantities.find(
				(item) => item.variantId === record?.id
			);
			const quantity = itemQuantity ? itemQuantity?.quantity : 0;
			return <Text className="text-xs">{formatNumber(quantity) || 0}</Text>;
		},
	},
];

export default productTotalColumns;
