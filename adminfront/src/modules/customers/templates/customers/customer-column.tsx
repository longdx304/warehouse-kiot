import { ActionAbles } from '@/components/Dropdown';
import { Customer } from '@medusajs/medusa';
import dayjs from 'dayjs';
import { Boxes, Pencil } from 'lucide-react';

type Props = {
	handleViewOrder: (record: Customer) => void;
	handleEditCustomer: (record: Customer) => void;
};

const customerColumns = ({ handleEditCustomer, handleViewOrder }: Props) => [
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		width: 150,
		className: 'text-xs',
		render: (_: string, record: Customer) => {
			return `${record.first_name || ''} ${record.last_name || ''}`;
		},
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Số điện thoại',
		dataIndex: 'phone',
		key: 'phone',
		width: 150,
		className: 'text-xs',
		render: (_: string) => {
			return `${_ || '-'} `;
		},
	},
	{
		title: 'Đơn hàng',
		dataIndex: 'orders',
		key: 'orders',
		width: 150,
		className: 'text-xs',
		render: (_: Customer['orders']) => {
			return _?.length || 0;
		},
	},
	{
		title: 'Ngày tạo',
		dataIndex: 'created_at',
		key: 'created_at',
		width: 150,
		className: 'text-xs',
		render: (_: Customer['created_at']) => {
			return dayjs(_).format('DD/MM/YYYY');
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: Customer) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditCustomer(record);
					},
				},
				{
					label: 'Danh sách đơn hàng',
					icon: <Boxes size={20} />,
					onClick: () => {
						handleViewOrder(record);
					},
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default customerColumns;
