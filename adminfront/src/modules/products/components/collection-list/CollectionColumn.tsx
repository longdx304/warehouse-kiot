import { NotebookPen, PackagePlus, Pencil, Trash2 } from 'lucide-react';

import { ActionAbles } from '@/components/Dropdown';
import { ProductCollection } from '@medusajs/medusa';
import { MenuProps } from 'antd';
import moment from 'moment';

interface Props {
	handleDeleteCollection: (collectionId: ProductCollection['id']) => void;
	handleEditCollection: (record: ProductCollection) => void;
	handleProductCollection: (record: ProductCollection) => void;
	handleAddProduct: (record: ProductCollection) => void;
}
const collectionColumns = ({
	handleEditCollection,
	handleDeleteCollection,
	handleProductCollection,
	handleAddProduct,
}: Props) => [
	{
		title: 'Tiêu đề',
		dataIndex: 'title',
		key: 'title',
		fixed: 'left',
		className: 'text-xs',
	},
	{
		title: 'Định danh',
		dataIndex: 'handle',
		key: 'handle',
		className: 'text-xs',
	},
	{
		title: 'Đã tạo lúc',
		dataIndex: 'created_at',
		key: 'created_at',
		className: 'text-xs',
		render: (create_at: string) => {
			return moment(create_at).format('L');
		},
	},
	{
		title: 'Đã cập nhật lúc',
		dataIndex: 'updated_at',
		key: 'updated_at',
		className: 'text-xs',
		render: (updated_at: string) => {
			return moment(updated_at).format('L');
		},
	},
	{
		title: 'Sản phẩm',
		dataIndex: 'products',
		key: 'products',
		className: 'text-xs',
		render: (products: any) => {
			return products?.length || '-';
		},
	},
	{
		title: '',
		key: 'action',
		width: 40,
		fixed: 'right',
		className: 'text-xs px-0',
		align: 'center',
		render: (_: any, record: ProductCollection) => {
			const actions = [
				{
					label: <span className="w-full">Chỉnh sửa bộ sưu tập</span>,
					key: 'edit',
					icon: <Pencil size={20} />,
				},
				{
					label: <span className="w-full">Thêm sản phẩm</span>,
					key: 'add',
					icon: <PackagePlus size={20} />,
				},
				{
					label: <span className="w-full">Quản lý sản phẩm</span>,
					key: 'product',
					icon: <NotebookPen size={20} />,
				},
				{
					label: <span className="w-full">Xoá bộ sưu tập</span>,
					key: 'delete',
					icon: <Trash2 size={20} />,
					danger: true,
				},
			];

			const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
				if (key === 'edit') {
					handleEditCollection(record);
					return;
				}
				// Case item is delete
				if (key === 'delete') {
					handleDeleteCollection(record.id);
					return;
				}
				if (key === 'add') {
					handleAddProduct(record);
					return;
				}
				if (key === 'product') {
					handleProductCollection(record);
					return;
				}
			};

			return <ActionAbles actions={actions} onMenuClick={handleMenuClick} />;
		},
	},
];

export default collectionColumns;
