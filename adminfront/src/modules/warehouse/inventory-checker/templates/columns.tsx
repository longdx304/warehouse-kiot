import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { ProductVariant } from '@/types/products';
import { Warehouse, WarehouseInventory } from '@/types/warehouse';
import { Minus, Pen, Plus, Trash2 } from 'lucide-react';

export interface WarehouseDataType {}

interface Props {}

const inventoryColumns = ({}: Props) => [
	{
		title: 'Sản phẩm',
		key: 'product',
		className: 'text-xs',
		fixed: 'left',
		render: (_: any, record: any) => {
			return (
				<Flex className="flex items-center gap-3">
					<Image
						src={record?.thumbnail ?? '/images/product-img.png'}
						alt="Product variant Thumbnail"
						width={30}
						height={40}
						className="rounded-md cursor-pointer"
					/>
					<Flex vertical className="">
						<Tooltip
							title={`${record.product_title} - ${record.variant_title}`}
						>
							<Text className="text-xs line-clamp-2">{`${record.product_title} - ${record.variant_title}`}</Text>
						</Tooltip>
						{/* <span className="text-gray-500">{_.title}</span> */}
					</Flex>
				</Flex>
			);
		},
	},
	{
		title: 'Số lượng hiện tại',
		key: 'inventory_quantity',
		dataIndex: 'inventory_quantity',
		className: 'text-xs',
		render: (_: number) => {
			return _ ?? 0;
		},
	},
	{
		title: 'Số lượng kho',
		key: 'total_quantity',
		dataIndex: 'total_quantity',
		className: 'text-xs',
		render: (_: number) => {
			return _ ?? 0;
		},
	},
];

export { inventoryColumns };
