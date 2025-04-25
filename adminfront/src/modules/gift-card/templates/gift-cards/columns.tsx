import { ActionAbles } from '@/components/Dropdown';
import { formatAmountWithSymbol } from '@/utils/prices';
import { GiftCard } from '@medusajs/medusa';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

type Props = {
	handleEdit: (record: GiftCard) => void;
	handleDelete: (id: GiftCard['id']) => void;
};

const giftCardColumns = ({ handleEdit, handleDelete }: Props) => [
	{
		title: 'Mã',
		dataIndex: 'code',
		key: 'code',
		fixed: 'left',
		className: 'text-xs',
	},
	{
		title: 'Đơn hàng',
		dataIndex: 'order',
		key: 'order',
		// width: 150,
		className: 'text-xs',
		render: (_: GiftCard['order']) => {
			return _ && _?.display_id ? `#${_?.display_id}` : '-';
		},
	},
	{
		title: 'Số tiền ban đầu',
		dataIndex: 'value',
		key: 'value',
		// width: 150,
		className: 'text-xs',
		render: (_: GiftCard['value'], record: GiftCard) => {
			return record.region
				? formatAmountWithSymbol({
						amount: _,
						currency: record.region.currency_code,
				  })
				: 'N/A';
		},
	},
	{
		title: 'Số dư',
		dataIndex: 'balance',
		key: 'balance',
		width: 150,
		className: 'text-xs',
		render: (_: GiftCard['balance'], record: GiftCard) => {
			return record.region
				? formatAmountWithSymbol({
						amount: _,
						currency: record.region.currency_code,
				  })
				: 'N/A';
		},
	},
	{
		title: 'Ngày tạo',
		dataIndex: 'created_at',
		key: 'created_at',
		// width: 150,
		className: 'text-xs',
		render: (_: GiftCard['created_at']) => {
			return dayjs(_).format('DD/MM/YYYY');
		},
	},
	{
		title: '',
		key: 'action',
		width: 60,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: GiftCard) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleEdit(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleDelete(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default giftCardColumns;
