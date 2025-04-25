import { ActionAbles } from '@/components/Dropdown';
import { CustomerGroup } from '@medusajs/medusa';
import { Boxes, Pencil, Trash2, UserRoundCog } from 'lucide-react';

type Props = {
	handleMembers: (record: CustomerGroup) => void;
	handleEditCustomers: (record: CustomerGroup) => void;
	handleDeleteCustomers: (id: CustomerGroup['id']) => void;
};

const customerGroupColumns = ({
	handleEditCustomers,
	handleMembers,
	handleDeleteCustomers,
}: Props) => [
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Thành viên',
		dataIndex: 'customers',
		key: 'customers',
		width: 150,
		className: 'text-xs',
		render: (_: CustomerGroup['customers']) => {
			return _?.length || 0;
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: CustomerGroup) => {
			const actions = [
				{
					label: 'Chỉnh sửa',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditCustomers(record);
					},
				},
				{
					label: 'Quản lý thành viên',
					icon: <UserRoundCog size={20} />,
					onClick: () => {
						handleMembers(record);
					},
				},
				{
					label: 'Xoá',
					danger: true,
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDeleteCustomers(record.id);
					},
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default customerGroupColumns;
