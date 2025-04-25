import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import { getErrorMessage } from '@/lib/utils';
import { Discount, DiscountCondition } from '@medusajs/medusa';
import { message } from 'antd';
import {
	useAdminAddDiscountConditionResourceBatch,
	useAdminDeleteDiscountConditionResourceBatch,
} from 'medusa-react';
import { createContext, Key, ReactNode, useContext } from 'react';

type ConditionsProviderProps = {
	condition: DiscountCondition;
	discount: Discount;
	onClose: () => void;
	children: ReactNode;
};

type EditConditionContextType = {
	condition: DiscountCondition;
	discount: Discount;
	isLoading: boolean;
	saveAndClose: (resources: string[]) => void;
	saveAndGoBack: (resources: string[]) => void;
	removeConditionResources: (resources: Key[]) => void;
};

const EditConditionContext = createContext<EditConditionContextType | null>(
	null
);

export const EditConditionProvider = ({
	condition,
	discount,
	onClose,
	children,
}: ConditionsProviderProps) => {
	const { pop, reset } = useContext(LayeredModalContext);

	const addConditionResourceBatch = useAdminAddDiscountConditionResourceBatch(
		discount.id,
		condition.id
	);

	const removeConditionResourceBatch =
		useAdminDeleteDiscountConditionResourceBatch(discount.id, condition.id);

	const addConditionResources = (
		resourcesToAdd: string[],
		onSuccessCallback?: () => void
	) => {
		addConditionResourceBatch.mutate(
			{ resources: resourcesToAdd.map((r) => ({ id: r })) },
			{
				onSuccess: () => {
					message.success('Thêm thành công');
					onSuccessCallback?.();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const removeConditionResources = (resourcesToRemove: Key[]) => {
		removeConditionResourceBatch.mutate(
			{ resources: resourcesToRemove.map((r) => ({ id: r as string })) },
			{
				onSuccess: () => {
					message.success('Xóa thành công');
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	function saveAndClose(resourcesToAdd: string[]) {
		addConditionResources(resourcesToAdd, () => onClose());
		reset();
	}

	function saveAndGoBack(resourcesToRemove: string[]) {
		addConditionResources(resourcesToRemove);
		pop();
	}

	return (
		<EditConditionContext.Provider
			value={{
				condition,
				discount,
				removeConditionResources,
				saveAndClose,
				saveAndGoBack,
				isLoading:
					addConditionResourceBatch.isLoading ||
					removeConditionResourceBatch.isLoading,
			}}
		>
			{children}
		</EditConditionContext.Provider>
	);
};

export const useEditConditionContext = () => {
	const context = useContext(EditConditionContext);
	if (context === null) {
		throw new Error(
			'useEditConditionContext must be used within an EditConditionProvider'
		);
	}
	return context;
};
