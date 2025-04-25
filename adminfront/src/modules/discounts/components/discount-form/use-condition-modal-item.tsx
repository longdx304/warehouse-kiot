import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import {
	DiscountConditionOperator,
	DiscountConditionType,
} from '@/types/discount';
import { useContext, useMemo } from 'react';
import ProductConditionSelector from './condition-tables/add-condition-tables/products';
import CustomerGroupConditionSelector from './condition-tables/add-condition-tables/customer-groups';
import CollectionConditionSelector from './condition-tables/add-condition-tables/collections';
import TypeConditionSelector from './condition-tables/add-condition-tables/types';
import TagConditionSelector from './condition-tables/add-condition-tables/tags';
import DetailsProductConditionSelector from '../details/conditions/tables/products';
import DetailsCustomerGroupConditionSelector from '../details/conditions/tables/customer-groups';
import DetailsTagConditionSelector from '../details/conditions/tables/tags';
import DetailsCollectionConditionSelector from '../details/conditions/tables/collections';
import DetailsTypeConditionSelector from '../details/conditions/tables/types';

export type ConditionItem = {
	label: string;
	value: DiscountConditionType;
	description: string;
	onClick: () => void;
};

type UseConditionModalItemsProps = {
	onClose: () => void;
	isDetails?: boolean;
};

export type AddConditionFooterProps = {
	type:
		| 'products'
		| 'product_collections'
		| 'product_types'
		| 'product_tags'
		| 'customer_groups';
	items: string[];
	operator: DiscountConditionOperator;
	onClose?: () => void;
};

const useConditionModalItems = ({
	isDetails,
	onClose = () => {},
}: UseConditionModalItemsProps) => {
	const layeredModalContext = useContext(LayeredModalContext);

	const items: ConditionItem[] = useMemo(
		() => [
			{
				label: 'Sản phẩm',
				value: DiscountConditionType.PRODUCTS,
				description: 'Chỉ áp dụng cho các sản phẩm cụ thể',
				onClick: () =>
					layeredModalContext.push({
						title: 'Chọn sản phẩm',
						onBack: () => layeredModalContext.pop(),
						footer: null,
						view: isDetails ? (
							<DetailsProductConditionSelector onClose={onClose} />
						) : (
							<ProductConditionSelector onClose={onClose} />
						),
					}),
			},
			{
				label: 'Nhóm khách hàng',
				value: DiscountConditionType.CUSTOMER_GROUPS,
				description: 'Chỉ áp dụng cho các nhóm khách hàng cụ thể',
				onClick: () =>
					layeredModalContext.push({
						title: 'Chọn nhóm khách hàng',
						onBack: () => layeredModalContext.pop(),
						footer: null,
						view: isDetails ? (
							<DetailsCustomerGroupConditionSelector onClose={onClose} />
						) : (
							<CustomerGroupConditionSelector onClose={onClose} />
						),
					}),
			},
			{
				label: 'Thẻ sản phẩm',
				value: DiscountConditionType.PRODUCT_TAGS,
				description: 'Chỉ áp dụng cho các thẻ cụ thể',
				onClick: () =>
					layeredModalContext.push({
						title: 'Chọn thẻ sản phẩm',
						onBack: () => layeredModalContext.pop(),
						footer: null,
						view: isDetails ? (
							<DetailsTagConditionSelector onClose={onClose} />
						) : (
							<TagConditionSelector onClose={onClose} />
						),
					}),
			},
			{
				label: 'Bộ sưu tập',
				value: DiscountConditionType.PRODUCT_COLLECTIONS,
				description: 'Chỉ áp dụng cho các bộ sưu tập cụ thể',
				onClick: () =>
					layeredModalContext.push({
						title: 'Chọn bộ sưu tập',
						onBack: () => layeredModalContext.pop(),
						footer: null,
						view: isDetails ? (
							<DetailsCollectionConditionSelector onClose={onClose} />
						) : (
							<CollectionConditionSelector onClose={onClose} />
						),
					}),
			},
			{
				label: 'Loại sản phẩm',
				value: DiscountConditionType.PRODUCT_TYPES,
				description: 'Chỉ áp dụng cho các loại sản phẩm cụ thể',
				onClick: () =>
					layeredModalContext.push({
						title: 'Chọn loại sản phẩm',
						onBack: () => layeredModalContext.pop(),
						footer: null,
						view: isDetails ? (
							<DetailsTypeConditionSelector onClose={onClose} />
						) : (
							<TypeConditionSelector onClose={onClose} />
						),
					}),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isDetails]
	);

	return items;
};

export default useConditionModalItems;
