'use server';

// Authentication actions
import { medusaClient } from '@/lib/database/config';
import { ProductCategory } from '@medusajs/medusa';
import { getMedusaHeaders } from './common';

export async function listCategories(): Promise<ProductCategory | null> {
	try {
		const headers = await getMedusaHeaders(['categories']);

		const { product_categories, count, offset, limit } =
			await medusaClient.admin.productCategories.list(
				{
					parent_category_id: 'null',
					include_descendants_tree: true,
				},
				headers
			);
		return product_categories as unknown as ProductCategory;
	} catch (error) {
		console.log('error', error);
		return null;
	}
}
