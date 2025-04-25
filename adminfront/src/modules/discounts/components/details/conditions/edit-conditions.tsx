import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { Discount, DiscountCondition } from '@medusajs/medusa';
import { useContext } from 'react';
import { EditConditionProvider } from './edit-condition/edit-condition-provider';
import ProductConditionsTable from './edit-condition/add-condition-resources/products/product';
import CustomerGroupConditionsTable from './edit-condition/add-condition-resources/customer-groups/customer-groups';
import CollectionConditionsTable from './edit-condition/add-condition-resources/collections/collections';
import ProductTypesConditionsTable from './edit-condition/add-condition-resources/product-types/product-types';
import TagConditionsTable from './edit-condition/add-condition-resources/tags/tag';

type Props = {
	open: boolean;
	condition: DiscountCondition;
	discount: Discount;
	onClose: () => void;
};

const EditConditions = ({ open, condition, discount, onClose }: Props) => {
	const context = useContext(LayeredModalContext);

	const renderModalContext = () => {
		switch (condition.type) {
			case 'products':
				return <ProductConditionsTable />;
			case 'product_collections':
				return <CollectionConditionsTable />;
			case 'product_types':
				return <ProductTypesConditionsTable />;
			case 'product_tags':
				return <TagConditionsTable />;
			case 'customer_groups':
				return <CustomerGroupConditionsTable />;
		}
	};

	const renderTitle = () => {
		switch (condition.type) {
			case 'products':
				return 'Chọn sản phẩm';
			case 'product_collections':
				return 'Chọn bộ sưu tập';
			case 'product_types':
				return 'Chọn loại sản phẩm';
			case 'product_tags':
				return 'Chọn tag sản phẩm';
			case 'customer_groups':
				return 'Chọn nhóm khách hàng';
		}
	};

	return (
		<EditConditionProvider
			condition={condition}
			discount={discount}
			onClose={onClose}
		>
			<LayeredModal
				context={context}
				onCancel={onClose}
				onOk={onClose}
				open={open}
				// footer={footer}
				title={renderTitle()}
				className="layered-modal"
				width={800}
			>
				{renderModalContext()}
			</LayeredModal>
		</EditConditionProvider>
	);
};

export default EditConditions;
