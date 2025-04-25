import { Metadata } from 'next';

import { Flex } from '@/components/Flex';
import CategoryList from '@/modules/product-categories/components/category-list';

export const metadata: Metadata = {
	title: 'Manage Product Categories',
	description: 'Categories Page',
};

interface Props {}

export default async function ProductCategories({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<CategoryList />
		</Flex>
	);
}
