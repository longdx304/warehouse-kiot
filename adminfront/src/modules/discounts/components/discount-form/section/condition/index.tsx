import { Discount } from '@medusajs/medusa';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useDiscountForm } from '../../discount-form-context';
import { Button } from '@/components/Button';
import { Plus } from 'lucide-react';
import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import AddConditionsModal from '../../add-conditions-modal';
import ConditionItem from './condition-item';

type DiscountNewConditionsProps = {
	discount?: Discount;
	closeForm: () => void;
	isDetails?: boolean;
};

const DiscountNewConditions: FC<DiscountNewConditionsProps> = ({
	discount,
	closeForm,
	isDetails,
}) => {
	const layeredModalContext = useContext(LayeredModalContext);
	const { setConditions, conditions } = useDiscountForm();

	useEffect(() => {
		if (discount?.rule?.conditions) {
			for (const condtion of discount.rule.conditions) {
				setConditions((prevCond) => ({
					...prevCond,
					[condtion.type]: {
						...conditions[condtion.type],
						id: condtion.id,
						operator: condtion.operator,
						type: condtion.type,
					},
				}));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discount?.rule?.conditions]);

	const allSet = useMemo(() => {
		const allSet = Object.values(conditions).every((condition) => {
			return condition.items.length;
		});
		return allSet;
	}, [conditions]);

	const filteredConditions = useMemo(() => {
		return Object.values(conditions).filter((condition) => {
			return condition.id || condition.items.length;
		});
	}, [conditions]);

	// Modal: Render footer buttons
	const footer = (
		<div className="flex items-center justify-end gap-2">
			<Button
				onClick={() => layeredModalContext.pop()}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Quay lại
			</Button>
			{/* <Button className="text-sm min-w-32 justify-center" onClick={() => {}}>
				Lưu
			</Button> */}
		</div>
	);

	const handleAddCondition = () => {
		layeredModalContext.push({
			title: (
				<div>
					<div>Thêm điều kiện</div>
					<div className="font-normal text-xs text-gray-500">
						Bạn chỉ có thể thêm một điều kiện cho mỗi loại
					</div>
				</div>
			),
			onBack: () => layeredModalContext.pop(),
			view: <AddConditionsModal />,
			// view: <AddConditionsModal conditions={conditions} />,
			footer,
		});
	};

	return (
		<div>
			<div className="flex flex-col gap-2 mb-4">
				{filteredConditions.map((condition, i) => (
					<ConditionItem
						key={condition.type}
						index={i}
						discountId={discount?.id}
						conditionId={condition.id}
						type={condition.type}
						setCondition={setConditions}
						items={condition.items}
					/>
				))}
			</div>
			{!allSet && (
				<Button
					type="default"
					icon={<Plus size={18} />}
					className="w-full"
					onClick={handleAddCondition}
				>
					Thêm điều kiện
				</Button>
			)}
		</div>
	);
};

export default DiscountNewConditions;
