import { handleErrorZod } from '@/lib/utils';
import { z } from 'zod';

const createProductSchema = z.object({
	productName: z
		.string()
		.min(2, {
			message: 'Sản phẩm phải có ít nhất 2 ký tự',
		})
		.max(50, {
			message: 'Sản phẩm không được vượt quá 50 ký tự',
		}),
	color: z
		.string()
		.min(2, {
			message: 'Màu sắc phải có ít nhất 2 kí tự',
		})
		.max(20, {
			message: 'Màu sắc không được vượt quá 20 kí tự',
		}),
	quantity: z.number().int().min(1, {
		message: 'Số lượng phải lớn hơn 0',
	}),
	price: z.number().min(1, {
		message: 'Giá tiền phải lớn hơn 0',
	}),
	inventoryQuantity: z.number().int().min(1, {
		message: 'Số lượng tồn kho phải lớn hơn 0',
	}),
});

export async function createProduct(
	_currentState: unknown,
	formData: FormData
) {
	try {
		const productName = formData.get('productName') as string;
		const color = formData.get('color') as string;
		const quantity = formData.get('quantity') as unknown as number;
		const price = formData.get('price') as unknown as number;
		const inventoryQuantity = formData.get(
			'inventoryQuantity'
		) as unknown as number;

		const resolver = handleErrorZod(
			createProductSchema.safeParse({
				productName,
				color,
				quantity,
				price,
				inventoryQuantity,
			})
		);
		if (resolver) {
			return resolver;
		}
	} catch (error: any) {
		console.log(' error ', error.message);
	}
}
