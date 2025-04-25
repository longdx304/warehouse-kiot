import { ActionAbles } from '@/components/Dropdown';
import { ReturnReason } from '@medusajs/medusa';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
	handleEditReturnReason: (record: ReturnReason) => void;
	handleDeleteReturnReason: (recordId: ReturnReason['id']) => void;
};

const returnReasonsColumns = ({
	handleEditReturnReason,
	handleDeleteReturnReason,
}: Props) => [
	{
		title: 'Nhãn',
		dataIndex: 'label',
		key: 'label',
		fixed: 'left',
		width: 80,
		className: 'text-xs',
	},
	{
		title: 'Mô tả lý do',
		dataIndex: 'description',
		key: 'description',
		width: 150,
		className: 'text-xs',
		render: (_: ReturnReason['description']) => {
			return _ || '-';
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: ReturnReason) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditReturnReason(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDeleteReturnReason(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default returnReasonsColumns;
