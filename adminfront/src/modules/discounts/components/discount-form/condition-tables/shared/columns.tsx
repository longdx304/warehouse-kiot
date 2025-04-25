import {
	Product,
	ProductCollection
} from '@medusajs/medusa';
import { Dot } from 'lucide-react';
import Image from 'next/image';

const ProductColumns = [
	{
		title: 'Sản phẩm',
		dataIndex: 'title',
		fixed: 'left',
		className: 'text-xs',
		render: (text: string, record: Product) => (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				{record.thumbnail && (
					<Image
						src={record.thumbnail}
						alt={text}
						style={{ marginRight: 8 }}
						width={30}
						height={40}
					/>
				)}
				<span>{text}</span>
			</div>
		),
	},
	{
		title: 'Trạng thái',
		dataIndex: 'status',
		fixed: 'left',
		className: 'text-xs',
		render: (status: string) => (
			<div className="flex items-center">
				<Dot color={status === 'published' ? '#47B881' : '#E74C3C'} />
				<span>{status === 'published' ? 'Đang hoạt động' : 'Bản nháp'}</span>
			</div>
		),
	},
	{
		title: 'Biến thể',
		dataIndex: 'variants',
		fixed: 'left',
		className: 'text-xs',
		render: (variants: Product['variants']) => <span>{variants.length}</span>,
	},
];

const CustomerGroupColumns = [
	{
		title: 'Tên nhóm khách hàng',
		dataIndex: 'name',
		fixed: 'left',
		className: 'text-xs',
	},
	// {
	// 	title: 'Thành viên',
	// 	dataIndex: 'customers',
	// 	fixed: 'left',
	// 	className: 'text-xs',
	// 	render: (_: CustomerGroup['customers']) => {
	// 		return _?.length || 0;
	// 	},
	// },
];

const TagColumns = [
	{
		title: 'Tên thẻ',
		dataIndex: 'value',
		fixed: 'left',
		className: 'text-xs',
	},
];

const CollectionColumns = [
	{
		title: 'Bộ sưu tập',
		dataIndex: 'title',
		fixed: 'left',
		className: 'text-xs',
	},
	{
		title: 'Sản phẩm',
		dataIndex: 'products',
		fixed: 'left',
		className: 'text-xs',
		render: (_: ProductCollection['products']) => {
			return _?.length || 0;
		},
	},
];

const TypeColumns = [
	{
		title: 'Loại',
		dataIndex: 'value',
		fixed: 'left',
		className: 'text-xs',
	},
];

export {
	CollectionColumns, CustomerGroupColumns, ProductColumns, TagColumns, TypeColumns
};
