import { ActionAbles } from '@/components/Dropdown';
import {
	ConditionMap,
	DiscountConditionOperator,
	DiscountConditionType,
} from '@/types/discount';
import { EditIcon, TrashIcon } from 'lucide-react';
import { useAdminGetDiscountCondition } from 'medusa-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDiscountForm } from '../../discount-form-context';
import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import ProductConditionSelector from '../../condition-tables/add-condition-tables/products';
import CustomerGroupConditionSelector from '../../condition-tables/add-condition-tables/customer-groups';
import CollectionConditionSelector from '../../condition-tables/add-condition-tables/collections';
import TagConditionSelector from '../../condition-tables/add-condition-tables/tags';
import TypeConditionSelector from '../../condition-tables/add-condition-tables/types';

type ConditionItemProps<Type extends DiscountConditionType> = {
	index: number;
	discountId?: string;
	conditionId?: string;
	type: Type;
	setCondition: React.Dispatch<React.SetStateAction<ConditionMap>>;
	items: string[];
};

const ConditionItem = <Type extends DiscountConditionType>({
	index,
	discountId,
	conditionId,
	type,
	setCondition,
	items,
}: ConditionItemProps<Type>) => {
	const layeredModalContext = useContext(LayeredModalContext);
	const queryParams = useMemo(() => {
		switch (type) {
			case DiscountConditionType.PRODUCTS:
				return { expand: 'products' };
			case DiscountConditionType.PRODUCT_COLLECTIONS:
				return { expand: 'product_collections' };
			case DiscountConditionType.PRODUCT_TAGS:
				return { expand: 'product_tags' };
			case DiscountConditionType.CUSTOMER_GROUPS:
				return { expand: 'customer_groups' };
			case DiscountConditionType.PRODUCT_TYPES:
				return { expand: 'product_types' };
		}
	}, [type]);

	//
	const { discount_condition } = useAdminGetDiscountCondition(
		discountId!,
		conditionId!,
		queryParams,
		{
			enabled: !!discountId && !!conditionId,
			cacheTime: 0,
		}
	);

	const { updateCondition } = useDiscountForm();

	useEffect(() => {
		if (!discount_condition) {
			return;
		}

		switch (type) {
			case DiscountConditionType.PRODUCTS:
				setCondition((prevConditions) => {
					return {
						...prevConditions,
						products: {
							...prevConditions.products,
							id: discount_condition.id,
							operator: discount_condition.operator,
							items: discount_condition.products.map((p) => p.id),
						},
					};
				});
				break;
			case DiscountConditionType.PRODUCT_COLLECTIONS:
				setCondition((prevConditions) => {
					return {
						...prevConditions,
						product_collections: {
							...prevConditions.product_collections,
							id: discount_condition.id,
							operator: discount_condition.operator,
							items: discount_condition.product_collections.map((p) => p.id),
						},
					};
				});
				break;
			case DiscountConditionType.PRODUCT_TAGS:
				setCondition((prevConditions) => {
					return {
						...prevConditions,
						product_tags: {
							...prevConditions.product_tags,
							id: discount_condition.id,
							operator: discount_condition.operator,
							items: discount_condition.product_tags.map((p) => p.id),
						},
					};
				});
				break;
			case DiscountConditionType.CUSTOMER_GROUPS:
				setCondition((prevConditions) => {
					return {
						...prevConditions,
						customer_groups: {
							...prevConditions.customer_groups,
							id: discount_condition.id,
							operator: discount_condition.operator,
							items: discount_condition.customer_groups.map((p) => p.id),
						},
					};
				});
				break;
			case DiscountConditionType.PRODUCT_TYPES:
				setCondition((prevConditions) => {
					return {
						...prevConditions,
						product_types: {
							...prevConditions.product_types,
							id: discount_condition.id,
							operator: discount_condition.operator,
							items: discount_condition.product_types.map((p) => p.id),
						},
					};
				});
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discount_condition, type]);

	// If no items in the list, don't render anything
	if (!items.length) {
		return null;
	}

	const handleEditCondition = () => {
		switch (type) {
			case DiscountConditionType.PRODUCTS:
				return layeredModalContext.push({
					title: 'Chỉnh sửa sản phẩm',
					onBack: () => layeredModalContext.pop(),
					footer: null,
					view: <ProductConditionSelector isEdit />,
				});
			case DiscountConditionType.CUSTOMER_GROUPS:
				return layeredModalContext.push({
					title: 'Chỉnh sửa nhóm khách hàng',
					onBack: () => layeredModalContext.pop(),
					footer: null,
					view: <CustomerGroupConditionSelector isEdit />,
				});
			case DiscountConditionType.PRODUCT_COLLECTIONS:
				return layeredModalContext.push({
					title: 'Chỉnh sửa bộ sưu tập',
					onBack: () => layeredModalContext.pop(),
					footer: null,
					view: <CollectionConditionSelector isEdit />,
				});
			case DiscountConditionType.PRODUCT_TAGS:
				return layeredModalContext.push({
					title: 'Chỉnh sửa thẻ sản phẩm',
					onBack: () => layeredModalContext.pop(),
					footer: null,
					view: <TagConditionSelector isEdit />,
				});
			case DiscountConditionType.PRODUCT_TYPES:
				return layeredModalContext.push({
					title: 'Chỉnh sửa loại sản phẩm',
					onBack: () => layeredModalContext.pop(),
					footer: null,
					view: <TypeConditionSelector isEdit />,
				});
		}
	};

	return (
		<div>
			<div className="p-4 rounded-lg gap-4 flex items-center justify-between border border-solid border-gray-200">
				<div className="gap-4 flex w-full overflow-hidden">
					<div className="aspect-square h-[44px] w-auto flex items-center justify-center bg-gray-200 rounded-lg text-sm text-gray-500">{`§${
						index + 1
					}`}</div>
					<div className="flex w-full flex-1 flex-col justify-center truncate">
						<div className="font-semibold">{getTitle(type)}</div>
						<span className="text-gray-400 text-xs">
							{`Số lượng: ${items.length}`}
						</span>
					</div>
				</div>
				<ActionAbles
					actions={
						[
							{
								label: 'Chỉnh sửa',
								onClick: handleEditCondition,
								icon: <EditIcon size={16} />,
							},
							{
								label: 'Xoá điều kiện',
								onClick: () =>
									updateCondition({
										type,
										items: [],
										operator: DiscountConditionOperator.IN,
									}),
								icon: <TrashIcon size={16} />,
								danger: true,
							},
						] as any
					}
				/>
			</div>
		</div>
	);
};

const getTitle = (type: DiscountConditionType) => {
	switch (type) {
		case DiscountConditionType.PRODUCTS:
			return 'Sản phẩm';
		case DiscountConditionType.PRODUCT_COLLECTIONS:
			return 'Bộ sưu tập';
		case DiscountConditionType.PRODUCT_TAGS:
			return 'Thẻ sản phẩm';
		case DiscountConditionType.CUSTOMER_GROUPS:
			return 'Nhóm khách hàng';
		case DiscountConditionType.PRODUCT_TYPES:
			return 'Loại sản phẩm';
	}
};

export default ConditionItem;
