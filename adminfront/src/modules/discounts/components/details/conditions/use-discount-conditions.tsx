import { getErrorMessage } from '@/lib/utils';
import { DiscountConditionType } from '@/types/discount';
import { Discount } from '@medusajs/medusa';
import { message } from 'antd';
import { EditIcon, TrashIcon } from 'lucide-react';
import {
	useAdminDiscount,
	useAdminDiscountRemoveCondition,
	useAdminGetDiscountCondition,
} from 'medusa-react';
import { useState } from 'react';

export const useDiscountConditions = (discount: Discount) => {
	const [selectedCondition, setSelectedCondition] = useState<string | null>(
		null
	);

	const { refetch } = useAdminDiscount(discount.id);
	const { discount_condition } = useAdminGetDiscountCondition(
		discount.id,
		selectedCondition!,
		{
			expand:
				'product_collections,product_tags,product_types,customer_groups,products',
		},
		{ enabled: !!selectedCondition, cacheTime: 0 }
	);
	const { mutate } = useAdminDiscountRemoveCondition(discount.id);

	const removeCondition = (conditionId: string) => {
		mutate(conditionId, {
			onSuccess: () => {
				message.success('Điều kiện đã được xóa thành công');
				refetch();
			},
			onError: (error) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	const itemized = discount.rule.conditions.map((condition) => ({
		type: condition.type,
		title: getTitle(condition.type),
		description: getDescription(condition.type),
		actions: [
			{
				label: 'Chỉnh sửa điều kiện',
				icon: <EditIcon size={16} />,
				onClick: () => setSelectedCondition(condition.id),
			},
			{
				label: 'Xóa điều kiện',
				icon: <TrashIcon size={16} />,
				danger: true,
				onClick: () => removeCondition(condition.id),
			},
		] as any[],
	}));

	function deSelectCondition() {
		setSelectedCondition(null);
	}

	return {
		conditions: itemized,
		selectedCondition: discount_condition,
		deSelectCondition,
	};
};

const getTitle = (type: DiscountConditionType) => {
	switch (type) {
		case DiscountConditionType.PRODUCTS:
			return 'Sản phẩm';
		case DiscountConditionType.PRODUCT_COLLECTIONS:
			return 'Bộ sưu tập';
		case DiscountConditionType.PRODUCT_TAGS:
			return 'Tag';
		case DiscountConditionType.PRODUCT_TYPES:
			return 'Loại sản phẩm';
		case DiscountConditionType.CUSTOMER_GROUPS:
			return 'Nhóm khách hàng';
	}
};

const getDescription = (type: DiscountConditionType) => {
	switch (type) {
		case DiscountConditionType.PRODUCTS:
			return 'Giảm giá áp dụng cho các sản phẩm cụ thể';
		case DiscountConditionType.PRODUCT_COLLECTIONS:
			return 'Giảm giá áp dụng cho các bộ sưu tập cụ thể';
		case DiscountConditionType.PRODUCT_TAGS:
			return 'Giảm giá áp dụng cho các tag cụ thể';
		case DiscountConditionType.PRODUCT_TYPES:
			return 'Giảm giá áp dụng cho các loại sản phẩm cụ thể';
		case DiscountConditionType.CUSTOMER_GROUPS:
			return 'Giảm giá áp dụng cho các nhóm khách hàng cụ thể';
	}
};
