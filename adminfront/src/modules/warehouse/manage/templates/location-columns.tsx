import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { ProductVariant } from '@/types/products';
import { Warehouse, WarehouseInventory } from '@/types/warehouse';
import { Minus, Pen, Plus, Trash2 } from 'lucide-react';

export interface WarehouseDataType {}

interface Props {
	handleRemoveWarehouse: (id: string) => void;
	handleEditWarehouse: (item: Warehouse) => void;
}

const warehouseColumns = ({
	handleEditWarehouse,
	handleRemoveWarehouse,
}: Props) => [
	{
		title: 'Vị trí',
		key: 'location',
		dataIndex: 'location',
		className: 'text-xs',
		fixed: 'left',
		render: (_: Warehouse['location']) => {
			return _;
		},
	},
	{
		title: 'Hiện có (sản phẩm)',
		key: 'inventories',
		dataIndex: 'inventories',
		className: 'text-xs text-center text-bold',
		render: (_: Warehouse['inventories']) => {
			return _?.length ?? 0;
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: Warehouse) => {
			const actions = [
				{
					label: 'Thêm sản phẩm',
					icon: <Pen size={20} />,
					onClick: () => {
						handleEditWarehouse(record);
					},
				},
				{
					label: 'Xoá vị trí',
					icon: <Trash2 size={20} />,
					danger: true,
					onClick: () => {
						handleRemoveWarehouse(record.id);
					},
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

interface ExpandedColumnsProps {
	handleAddInventory: (record: WarehouseInventory) => void;
	handleRemoveInventory: (record: WarehouseInventory) => void;
}

const expandedColumns = ({
	handleAddInventory,
	handleRemoveInventory,
}: ExpandedColumnsProps) => [
	{
		title: 'Sản phẩm',
		key: 'title',
		dataIndex: 'variant',
		className: 'text-xs',
		fixed: 'left',
		render: (_: ProductVariant) => {
			return (
				<Flex className="flex items-center gap-3">
					<Image
						src={_?.product?.thumbnail ?? '/images/product-img.png'}
						alt="Product variant Thumbnail"
						width={30}
						height={40}
						className="rounded-md cursor-pointer"
					/>
					<Flex vertical className="">
						<Tooltip title={`${_.product.title} - ${_.title}`}>
							<Text className="text-xs line-clamp-2">{`${_.product.title} - ${_.title}`}</Text>
						</Tooltip>
						<span className="text-gray-500">{_.title}</span>
					</Flex>
				</Flex>
			);
		},
	},
	{
		title: 'Số lượng kho',
		key: 'quantity',
		dataIndex: 'quantity',
		className: 'text-xs',
		render: (_: WarehouseInventory['quantity'], record: WarehouseInventory) => {
			const quantity = _ / record.item_unit.quantity;
			return `${quantity} ${record.item_unit.unit} (${_} đôi)`;
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: WarehouseInventory) => {
			return (
				<Flex>
					<Minus
						onClick={() => handleRemoveInventory(record)}
						size={18}
						color="red"
						className="cursor-pointer"
					/>
					<Plus
						onClick={() => handleAddInventory(record)}
						size={18}
						color="green"
						className="cursor-pointer"
					/>
				</Flex>
			);
		},
	},
];

export { warehouseColumns, expandedColumns };
