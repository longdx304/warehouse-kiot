import { Flex } from '@/components/Flex';
import { Image } from '@/components/Image';
import { Text } from '@/components/Typography';
import { LineItem } from '@/types/lineItem';
import { FulfillmentItem } from '@medusajs/medusa';

type Props = {};

const fulfillmentColumns = [
	{
		title: '',
		key: 'image',
		dataIndex: 'image',
		width: 40,
		className: 'w-fit text-xs',
		fixed: 'left',
		render: (_: any, record: LineItem) => (
			<Image
				src={record.thumbnail ?? '/images/product-img.png'}
				alt="Product Thumbnail"
				width={40}
				height={40}
				className="rounded-md hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
			/>
		),
	},
	{
		title: '',
		key: '',
		dataIndex: 'item',
		// width: 150,
		className: 'text-xs',
		render: (_: any, record: LineItem) => (
			<Flex vertical className="flex items-start justify-start">
				<Text className="text-xs line-clamp-2" strong tooltip>
					{`${record.title} - ${record.description}`}
				</Text>
				<Text className="line-clamp-2" classNameText="text-[12px]">
					{`Xuất kho / Số lượng đơn`}
				</Text>
				<Text className="line-clamp-2" classNameText="text-[12px]">
					{`${record.warehouse_quantity} / ${record.quantity}`}
				</Text>
			</Flex>
		),
	},
];

export default fulfillmentColumns;
