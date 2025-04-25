// @ts-nocheck
import { ProductVariant } from '@medusajs/medusa';
import Image from 'next/image';
import React from 'react';

import { Flex } from '@/components/Flex';
import Tooltip from '@/components/Tooltip/Tooltip';
import { Text } from '@/components/Typography';
import { formatAmountWithSymbol } from '@/utils/prices';

interface Props {
	currencyCode: string;
}
const productsColumns = ({ currencyCode }: Props) => [
	{
		title: 'Chi tiết sản phẩm',
		key: 'product_title',
		dataIndex: 'product_title',
		width: 200,
		className: 'text-xs',
		fixed: 'left',
		render: (_: any, record: any) => (
			<div>
				<Flex className="flex items-center gap-3">
					<Image
						src={record?.thumbnail ?? '/images/product-img.png'}
						alt="Product variant Thumbnail"
						width={30}
						height={40}
						className="rounded-md cursor-pointer"
					/>
					<Flex vertical className="">
						<Tooltip title={record.product_title}>
							<Text className="text-xs line-clamp-2">
								{record.product_title}
							</Text>
						</Tooltip>
						<span className="text-gray-500">{`(${record.variant_title})`}</span>
					</Flex>
				</Flex>
				{(record?.reason || record?.note) && (
					<Flex gap="small" align="center" className="mt-2">
						<Text strong className="text-xs">
							{record?.reason?.label}
						</Text>
						<Text className="text-[12px]">{record?.note}</Text>
					</Flex>
				)}
			</div>
		),
	},
	{
		title: 'Số lượng',
		key: 'quantity',
		dataIndex: 'quantity',
		className: 'text-xs',
		editable: true,
		render: (_: number, record: any) => {
			return _;
		},
	},
	{
		title: 'Có thể hoàn tiền',
		key: 'refundable',
		dataIndex: 'refundable',
		className: 'text-xs',
		// width: 250,
		render: (_: number, record: any) => {
			if (!_) {
				return '-';
			}

			const showOriginal = _ !== 'default';
			return (
				<div className="flex items-center">
					<span className="pr-1">
						{formatAmountWithSymbol({
							currency: currencyCode,
							amount: _ || 0,
						})}
					</span>
					<span className="text-gray-400">{currencyCode.toUpperCase()}</span>
				</div>
			);
		},
	},
];

export default productsColumns;
