import { Product } from '@medusajs/medusa';
import { Dot } from 'lucide-react';
import Image from 'next/image';

import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatNumber } from '@/lib/utils';

interface Props {}
const productsColumns = ({}: Props) => [
	{
		title: 'Tên sản phẩm',
		key: 'information',
		width: 150,
		className: 'text-xs',
		fixed: 'left',
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
		render: (_: Product['status']) => {
			return (
				<Flex justify="flex-start" align="center" gap="2px">
					<Dot
						color={_ === 'published' ? 'rgb(52 211 153)' : 'rgb(156 163 175)'}
						size={20}
						strokeWidth={3}
						className="w-[20px]"
					/>
					<Text className="text-xs">
						{_ === 'published' ? 'Đang hoạt động' : 'Bản nháp'}
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
		render: (_: Product['variants']) => {
			const total = _.reduce(
				(acc, variant) => acc + variant.inventory_quantity,
				0
			);
			return `${formatNumber(total)} còn hàng cho ${_?.length || 0} biến thể`;
		},
	},
];

export default productsColumns;
