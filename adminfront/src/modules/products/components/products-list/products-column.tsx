import { Product } from '@medusajs/medusa';
import { Dot, MonitorX, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatNumber } from '@/lib/utils';
import { MenuProps } from 'antd';

interface Props {
	handleDeleteProduct: (userId: Product['id']) => void;
	handleEditProduct: (record: Product) => void;
	handleChangeStatus: (id: string, status: string) => void;
	// handleRow: (id: string) => any;
}
const productsColumns = ({
	handleDeleteProduct,
	handleEditProduct,
	handleChangeStatus,
}: Props) => [
	{
		title: 'Tên sản phẩm',
		key: 'information',
		width: 150,
		className: 'text-xs',
		fixed: 'left',
		// onCell: (record: Product) => handleRow(record.id),
		render: (_: any, record: Product) => (
			<Flex className="flex items-center gap-3">
				<Image
					src={record?.thumbnail ?? '/images/product-img.png'}
					alt="Product Thumbnail"
					width={30}
					height={40}
					className="rounded-md hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
				/>
				<Tooltip title={record.title}>
					<Text className="text-xs line-clamp-2">{record.title}</Text>
				</Tooltip>
			</Flex>
		),
	},
	{
		title: 'Bộ sưu tập',
		key: 'collection',
		dataIndex: 'collection',
		className: 'text-xs',
		width: 150,
		// onCell: (record: Product) => handleRow(record.id),
		render: (_: Product['collection']) => {
			return _?.title || '-';
		},
	},
	{
		title: 'Trạng thái',
		dataIndex: 'status',
		key: 'status',
		className: 'text-xs',
		width: 150,
		// onCell: (record: Product) => handleRow(record.id),
		render: (_: Product['status'], record: Product) => {
			const color = _ === 'published' ? 'rgb(52 211 153)' : 'rgb(156 163 175)';
			return (
				<Flex justify="flex-start" align="center" gap="2px">
					<Dot
						color={_ === 'published' ? 'rgb(52 211 153)' : 'rgb(156 163 175)'}
						size={20}
						strokeWidth={3}
						className="w-[20px]"
					/>
					<Text className="text-xs">
						{_ === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
					</Text>
				</Flex>
			);
		},
	},
	{
		title: 'Sẵn có',
		key: 'profile',
		dataIndex: 'profile',
		className: 'text-xs',
		width: 200,
		// onCell: (record: Product) => handleRow(record.id),
		render: (_: Product['profile']) => {
			return _?.name || '-';
		},
	},
	{
		title: 'Tồn kho',
		key: 'variants',
		dataIndex: 'variants',
		className: 'text-xs',
		width: 250,
		// onCell: (record: Product) => handleRow(record.id),
		render: (_: Product['variants']) => {
			const total = _.reduce(
				(acc, variant) => acc + variant.inventory_quantity,
				0
			);
			return `${formatNumber(total)} còn hàng cho ${_?.length || 0} biến thể`;
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs px-0',
		align: 'center',
		render: (_: any, record: any) => {
			const actions = [
				{
					label: <span className="w-full">Chỉnh sửa</span>,
					key: 'edit',
					icon: <Pencil size={20} />,
				},
				{
					label: (
						<span className="w-full">
							{record.status === 'published' ? 'Ngừng xuất bản' : 'Xuất bản'}
						</span>
					),
					key: 'stop-publishing',
					icon: <MonitorX size={20} />,
				},
				{
					label: <span className="w-full">Xoá</span>,
					key: 'delete',
					icon: <Trash2 size={20} />,
					danger: true,
				},
			];

			const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
				domEvent.stopPropagation();
				if (key === 'edit') {
					handleEditProduct(record);
					return;
				}
				// Case item is delete
				if (key === 'delete') {
					handleDeleteProduct(record.id);
					return;
				}
				if (key === 'stop-publishing') {
					handleChangeStatus(
						record.id,
						record.status === 'published' ? 'draft' : 'published'
					);
					return;
				}
			};

			return <ActionAbles actions={actions} onMenuClick={handleMenuClick} />;
		},
	},
];

export default productsColumns;
