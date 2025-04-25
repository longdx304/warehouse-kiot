import { ActionAbles } from '@/components/Dropdown';
import { Region } from '@medusajs/medusa';
import { Pencil, Trash2, Truck } from 'lucide-react';

type Props = {
	handleShippingOption: (record: Region) => void;
	// handleReturnShippingOption: (record: Region) => void;
	handleEditRegion: (record: Region) => void;
	handleDeleteRegion: (recordId: Region['id']) => void;
};

const regionColumns = ({
	handleEditRegion,
	handleShippingOption,
	// handleReturnShippingOption,
	handleDeleteRegion,
}: Props) => [
	{
		title: 'Khu vực',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Quốc gia',
		dataIndex: 'countries',
		key: 'countries',
		width: 150,
		className: 'text-xs',
		render: (_: Region['countries']) => {
			return _.map((region) => region.name).join(' - ');
		},
	},
	{
		title: 'Tiền tệ',
		dataIndex: 'currency',
		key: 'currency',
		width: 150,
		className: 'text-xs',
		render: (_: Region['currency']) => {
			return _?.name || '-';
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: Region) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditRegion(record);
					},
				},
				{
					label: 'Tuỳ chọn vận chuyển',
					icon: <Truck size={20} />,
					onClick: () => {
						handleShippingOption(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: () => {
						handleDeleteRegion(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default regionColumns;
