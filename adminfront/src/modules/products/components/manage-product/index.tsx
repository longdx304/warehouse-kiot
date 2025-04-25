'use client';
import { type TabsProps } from 'antd';
import { FC } from 'react';

import { Card } from '@/components/Card';
import { Tabs } from '@/components/Tabs';
import CollectionList from '@/modules/products/components/collection-list';
import ProductList from '@/modules/products/components/products-list';

type Props = {};

const ManageProduct: FC<Props> = ({}) => {
	const itemsTab: TabsProps['items'] = [
		{
			key: 'products',
			label: 'Sản phẩm',
			children: <ProductList />,
		},
		{
			key: 'collections',
			label: 'Bộ sưu tập',
			children: <CollectionList />,
		},
	];
	return (
		<Card className="w-full" bordered={false}>
			<Tabs items={itemsTab} />
		</Card>
	);
};

export default ManageProduct;
