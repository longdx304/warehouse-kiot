import { ActionAbles } from '@/components/Dropdown';
import { Tag } from '@/components/Tag';
import { formatNumber } from '@/lib/utils';
import { ShippingOption } from '@medusajs/medusa';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
	handleEdit: (record: ShippingOption) => void;
	handleDelete: (recordId: ShippingOption['id']) => void;
};

const shippingColumns = ({ handleEdit, handleDelete }: Props) => [
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		className: 'text-xs',
	},
	{
		title: 'Phí vận chuyển',
		dataIndex: 'amount',
		key: 'amount',
		className: 'text-xs',
		render: (_: ShippingOption['amount']) => {
			return formatNumber(_ || 0);
		},
	},
	{
		title: 'Hiển thị tại',
		dataIndex: 'admin_only',
		key: 'admin_only',
		className: 'text-xs',
		render: (_: ShippingOption['admin_only']) => {
			const data = _ ? 'Admin' : 'Khách hàng';
			return <Tag color={_ ? 'red' : 'green'}>{data}</Tag>;
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: ShippingOption) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEdit(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDelete(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default shippingColumns;
