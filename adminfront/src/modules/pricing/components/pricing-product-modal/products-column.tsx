import { Product } from '@medusajs/medusa';
import { Pencil, Trash } from 'lucide-react';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { ActionAbles } from '@/components/Dropdown';

interface Props {
	handleEditPricing: (record: Product) => void;
	handleDeletePricing: (id: string) => void;
}
const productsColumns = ({ handleEditPricing, handleDeletePricing }: Props) => [
	{
		title: 'Tên sản phẩm',
		key: 'information',
		width: 150,
		className: 'text-xs',
		fixed: 'left',
		render: (_: any, record: Product) => (
			<Flex className="flex items-center gap-3">
				<Image
					src={record?.thumbnail ?? '/images/product-img.png'}
					alt="Product Thumbnail"
					width={30}
					height={40}
					className="rounded-md hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
				/>
				<Tooltip title={record.title}>
					<Text className="text-xs line-clamp-2">{record.title}</Text>
				</Tooltip>
			</Flex>
		),
	},
	{
		title: 'Bộ sưu tập',
		key: 'collection',
		dataIndex: 'collection',
		className: 'text-xs',
		width: 150,
		render: (_: Product['collection']) => {
			return _?.title || '-';
		},
	},
	{
		title: 'Biến thể',
		dataIndex: 'variants',
		key: 'variants',
		className: 'text-xs',
		width: 150,
		render: (_: Product['variants']) => {
			return _?.length || '-';
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: Product) => {
			const actions = [
				{
					label: 'Chỉnh sửa giá',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditPricing(record);
					},
				},
				{
					label: 'Xóa',
					icon: <Trash size={20} />,
					danger: true,
					onClick: () => {
						handleDeletePricing(record.id);
					},
				},
			];

			return <ActionAbles id="detail-product" actions={actions as any} />;
		},
	},
];

export default productsColumns;
