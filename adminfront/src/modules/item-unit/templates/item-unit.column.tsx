import { ActionAbles } from '@/components/Dropdown';
import { ItemUnit } from '@/types/item-unit';
import { FilePenLine, Trash2 } from 'lucide-react';

type Props = {
	handleEditItemUnit: (recordId: ItemUnit) => void;
	handleDeleteItemUnit: (recordId: ItemUnit['id']) => void;
};

const itemUnitColumns = ({
	handleEditItemUnit,
	handleDeleteItemUnit,
}: Props) => [
	{
		title: 'Đơn vị',
		dataIndex: 'unit',
		key: 'unit',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Số lượng',
		dataIndex: 'quantity',
		key: 'quantity',
		width: 150,
		className: 'text-xs',
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: ItemUnit) => {
			const actions = [
				{
					label: 'Chỉnh sửa',
					icon: <FilePenLine size={20} />,
					onClick: () => {
						handleEditItemUnit(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDeleteItemUnit(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default itemUnitColumns;
