import { ActionAbles } from '@/components/Dropdown';
import { Currency } from '@medusajs/medusa';
import { Pointer, Trash2 } from 'lucide-react';

type Props = {
	handleSetDefaultCurrency: (recordId: Currency['code']) => void;
	handleDeleteCurrency: (recordId: Currency['code']) => void;
};

const currencyColumns = ({
	handleSetDefaultCurrency,
	handleDeleteCurrency,
}: Props) => [
	{
		title: 'Code',
		dataIndex: 'code',
		key: 'code',
		fixed: 'left',
		width: 150,
		className: 'text-xs uppercase',
	},
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Đơn vị',
		dataIndex: 'symbol',
		key: 'symbol',
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
		render: (_: any, record: Currency) => {
			const actions = [
				{
					label: 'Đặt làm tiền tệ mặc định',
					icon: <Pointer size={20} />,
					onClick: () => {
						handleSetDefaultCurrency(record.code);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDeleteCurrency(record.code);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default currencyColumns;
