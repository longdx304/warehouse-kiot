import { ActionAbles } from '@/components/Dropdown';
import { Customer } from '@medusajs/medusa';
import { Trash2 } from 'lucide-react';

type Props = {
	handleDeleteCustomer: (id: Customer['id']) => void;
};

const memberColumns = ({ handleDeleteCustomer }: Props) => [
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		className: 'text-xs',
		render: (_: any, record: Customer) => {
			return `${record.first_name} ${record.last_name}`;
		},
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
		className: 'text-xs',
	},
	{
		title: 'Nhóm',
		dataIndex: 'groups',
		key: 'groups',
		width: 150,
		className: 'text-xs',
		render: (_: Customer['groups']) => {
			return _?.map((group) => group.name).join(' - ') || '-';
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
					label: 'Xoá khách hàng',
					icon: <Trash2 size={20} />,
					danger: true,
					onClick: () => {
						handleDeleteCustomer(record.id);
					},
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default memberColumns;
