import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text } from '@/components/Typography';
import { PriceList } from '@medusajs/medusa';
import { Dot, MonitorX, PackagePlus, Pencil, Trash } from 'lucide-react';

type Props = {
	handleDeletePricing: (id: string) => void;
	handleEditPricing: (record: PriceList) => void;
	handleChangeStatue: (record: PriceList) => void;
	handleListProduct: (record: PriceList) => void;
};

const pricingColumns = ({
	handleEditPricing,
	handleDeletePricing,
	handleChangeStatue,
	handleListProduct,
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
		title: 'Mô tả',
		dataIndex: 'description',
		key: 'description',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Trạng thái',
		dataIndex: 'status',
		key: 'status',
		width: 150,
		className: 'text-xs',
		render: (_: string) => {
			return (
				<Flex justify="flex-start" align="center" gap="2px">
					<Dot
						color={_ === 'active' ? 'rgb(52 211 153)' : 'rgb(156 163 175)'}
						size={20}
						strokeWidth={3}
						className="w-[20px]"
					/>
					<Text className="text-xs">
						{_ === 'active' ? 'Đang hoạt động' : 'Bản nháp'}
					</Text>
				</Flex>
			);
		},
	},
	{
		title: 'Nhóm người dùng',
		dataIndex: 'customer_groups',
		key: 'customer_groups',
		width: 150,
		className: 'text-xs',
		render: (_: any) => {
			return _?.length || '-';
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: PriceList) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin chung',
					icon: <Pencil size={20} />,
					onClick: () => {
						handleEditPricing(record);
					},
				},
				{
					label: 'Danh sách sản phẩm',
					icon: <PackagePlus size={20} />,
					onClick: () => {
						handleListProduct(record);
					},
				},
				{
					label: (
						<span className="w-full">
							{record.status === 'active' ? 'Ngừng kích hoạt' : 'Kích hoạt'}
						</span>
					),
					key: 'stop-publishing',
					icon: <MonitorX size={20} />,
					onClick: () => {
						handleChangeStatue(record);
					},
				},
				{
					label: 'Xóa',
					icon: <Trash size={20} />,
					danger: true,
					onClick: () => {
						handleDeletePricing(record.id);
					},
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default pricingColumns;
