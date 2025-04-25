import { getErrorMessage } from '@/lib/utils';
import { ERoutes } from '@/types/routes';
import { removeFalsy } from '@/utils/remove-nullish';
import { Discount } from '@medusajs/medusa';
import { message } from 'antd';
import { useAdminCreateDiscount } from 'medusa-react';
import { useRouter } from 'next/navigation';

const useCopyPromotion = () => {
	const router = useRouter();
	const createPromotion = useAdminCreateDiscount();

	const handleCopyPromotion = async (promotion: Discount) => {
		const copy: any = {
			code: `${promotion.code}_COPY`,
			is_disabled: promotion.is_disabled,
			is_dynamic: promotion.is_dynamic,
			starts_at: promotion.starts_at,
			regions: promotion.regions.map((region) => region.id),
		};

		if (promotion.ends_at) {
			copy.ends_at = promotion.ends_at;
		}

		if (promotion.valid_duration) {
			copy.valid_duration = promotion.valid_duration;
		}

		if (typeof promotion.usage_limit === 'number') {
			copy.usage_limit = promotion.usage_limit;
		}

		if (promotion.metadata) {
			copy.metadata = promotion.metadata;
		}

		copy.rule = {
			type: promotion.rule.type,
			value: promotion.rule.value,
			description: promotion.rule.description,
		};

		if (promotion.rule.allocation) {
			copy.rule.allocation = promotion.rule.allocation;
		}

		if (promotion.rule.conditions) {
			copy.rule.conditions = promotion.rule.conditions.map((cond) => ({
				operator: cond.operator,
				...removeFalsy({
					products: cond.products.map((product) => product.id),
					product_types: cond.product_types,
					product_tags: cond.product_tags,
					product_collections: cond.product_collections,
					customer_groups: cond.customer_groups,
				}),
			}));
		}

		await createPromotion.mutate(copy, {
			onSuccess: (result) => {
				router.push(`${ERoutes.DISCOUNTS}/${result.discount.id}`);
				message.success('Sao chép khuyến mãi thành công');
			},
			onError: (err) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	return handleCopyPromotion;
};

export default useCopyPromotion;
