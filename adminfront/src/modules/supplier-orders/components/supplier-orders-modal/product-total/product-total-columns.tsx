import { ProductVariant, Region } from '@medusajs/medusa';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import { Tag } from '@/components/Tag';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { ItemPrice, ItemQuantity } from '../index';
import { formatNumber } from '@/lib/utils';

interface Props {
	itemQuantities: ItemQuantity[];
	itemPrices: ItemPrice[];
	region?: Region;
	currentPage: number;
}

const PAGE_SIZE = 10;
const productTotalColumns = ({
	itemQuantities,
	itemPrices,
	region,
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
			// return <Text className="text-xs">{quantity || 0}</Text>;
			return <Text className="text-xs">{formatNumber(quantity) || 0}</Text>;
		},
	},
	{
		title: 'Giá đơn hàng',
		key: 'price',
		dataIndex: 'price',
		className: 'text-xs text-center',
		render: (_: number, record: any) => {
			const itemPrice = itemPrices?.find(
				(item) => item?.variantId === record?.id
			);
			const price = itemPrice ? itemPrice?.unit_price : 0;

			return (
				<Text className="text-xs">
					{price?.toLocaleString()}
					{region?.currency.symbol}
				</Text>
			);
		},
	},
];

export default productTotalColumns;
