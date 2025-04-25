import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import { DiscountCondition } from '@medusajs/medusa';
import { useContext } from 'react';
import AddProduct from './add-condition-resources/products/add-product';
import AddCustomerGroups from './add-condition-resources/customer-groups/add-customer-groups';
import AddCollections from './add-condition-resources/collections/add-collections';
import AddProductTags from './add-condition-resources/tags/add-tag';
import AddProductTypes from './add-condition-resources/product-types/add-product-types';

export const useAddConditionsModalScreen = (condition: DiscountCondition) => {
	const { pop } = useContext(LayeredModalContext);

	const renderModalScreen = () => {
		switch (condition.type) {
			case 'products':
				return <AddProduct />;
			case 'product_collections':
				return <AddCollections />;
			case 'product_types':
				return <AddProductTypes />;
			case 'product_tags':
				return <AddProductTags />;
			case 'customer_groups':
				return <AddCustomerGroups />;
		}
	};

	return {
		title: 'Thêm điều kiện',
		onBack: pop,
		view: renderModalScreen(),
		footer: null,
	};
};
