import { Copy, Pencil, Trash2 } from 'lucide-react';

import { ActionAbles } from '@/components/Dropdown';
import { MenuProps } from 'antd';
import { formatAmountWithSymbol } from '@/utils/prices';
import { ProductVariant } from '@/types/products';

interface Props {
	handleDeleteVariant: (variantId: ProductVariant['id']) => void;
	handleEditVariant: (record: ProductVariant) => void;
	handleCopyVariant: (record: ProductVariant) => void;
}
const variantsColumns = ({
	handleEditVariant,
	handleDeleteVariant,
	handleCopyVariant,
}: Props) => [
	{
		title: 'Tiêu đề',
		dataIndex: 'title',
		width: 100,
		key: 'title',
	},
	{
		title: 'SKU',
		dataIndex: 'sku',
		width: 120,
		key: 'sku',
	},
	{
		title: 'Tồn kho',
		dataIndex: 'inventory_quantity',
		width: 100,
		key: 'inventory_quantity',
	},
	{
		title: 'Giá nhập hàng',
		dataIndex: 'supplier_price',
		width: 120,
		key: 'supplier_price',
		render: (_: any) => {
			return formatAmountWithSymbol({ amount: _, currency: 'vnd' });
		},
	},
	{
		title: 'Giá vốn',
		dataIndex: 'cogs_price',
		width: 120,
		key: 'cogs_price',
		render: (_: any) => {
			return formatAmountWithSymbol({ amount: _, currency: 'vnd' });
		},
	},
	{
		title: 'Định lượng đôi',
		dataIndex: 'allowed_quantities',
		width: 100,
		key: 'allowed_quantities',
		render: (_: any) => {
			return _;
		},
	},
	{
		title: '',
		key: 'action',
		width: 60,
		fixed: 'right',
		render: (_: any, record: ProductVariant) => {
			const actions = [
				{
					label: <span className="w-full">Chỉnh sửa biến thể</span>,
					key: 'edit',
					icon: <Pencil size={20} />,
					// onClick: handleEditVariant(record),
				},
				{
					label: <span className="w-full">Nhân bản biến thể</span>,
					key: 'copy',
					icon: <Copy size={20} />,
				},
				{
					label: <span className="w-full">Xoá biến thể</span>,
					key: 'delete',
					icon: <Trash2 size={20} />,
					danger: true,
				},
			];

			const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
				if (key === 'edit') {
					handleEditVariant(record);
					return;
				}
				// Case item is delete
				if (key === 'delete') {
					handleDeleteVariant(record.id);
					return;
				}
				if (key === 'copy') {
					handleCopyVariant(record);
					return;
				}
			};

			return <ActionAbles actions={actions} onMenuClick={handleMenuClick} />;
		},
	},
];

export default variantsColumns;
