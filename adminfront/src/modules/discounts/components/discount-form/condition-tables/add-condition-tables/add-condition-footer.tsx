import { Button } from '@/components/Button';
import { useDiscountForm } from '../../discount-form-context';
import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import { useContext } from 'react';
import { DiscountConditionOperator } from '@/types/discount';

type AddConditionFooterProps = {
	type:
		| 'products'
		| 'product_collections'
		| 'product_types'
		| 'product_tags'
		| 'customer_groups';
	items: string[];
	operator: DiscountConditionOperator;
	isEdit?: boolean;
};

const AddConditionFooter = ({
	type,
	items,
	operator,
	isEdit = false,
}: AddConditionFooterProps) => {
	const { pop } = useContext(LayeredModalContext);
	const { updateCondition } = useDiscountForm();

	return (
		<div className="flex items-center justify-end gap-2 mt-4 pt-4 border-0 border-t border-solid border-gray-200">
			<Button
				onClick={() => pop()}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Quay lại
			</Button>
			{isEdit && (
				<Button
					onClick={() => {
						updateCondition({
							type,
							items: [],
							operator: DiscountConditionOperator.IN,
						});
						pop();
					}}
					type="text"
					danger
					className="text-sm w-32 font-semibold justify-center"
				>
					Xóa điều kiện
				</Button>
			)}
			<Button
				className="text-sm min-w-32 justify-center"
				onClick={() => {
					updateCondition({
						type,
						items,
						operator,
					});
					pop();
				}}
			>
				Lưu và thêm
			</Button>
		</div>
	);
};

export default AddConditionFooter;
