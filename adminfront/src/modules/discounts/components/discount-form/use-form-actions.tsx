import { useAdminCreateDiscount } from 'medusa-react';
import { useDiscountForm } from './discount-form-context';
import { DiscountFormValues } from '@/types/discount';
import { message } from 'antd';
import { formValuesToCreateDiscountMapper } from './mappers';
import { getErrorMessage } from '@/lib/utils';

export const useFormActions = () => {
	const createDiscount = useAdminCreateDiscount();

	const { conditions } = useDiscountForm();

	const onSaveAsInactive = async (values: DiscountFormValues) => {
		await createDiscount.mutateAsync(
			{
				...formValuesToCreateDiscountMapper(values, conditions),
				is_disabled: true,
			},
			{
				onSuccess: () => {
					message.success('Mã giảm giá đã được tạo thành công');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const onSaveAsActive = async (values: DiscountFormValues) => {
		await createDiscount.mutateAsync(
			{
				...formValuesToCreateDiscountMapper(values, conditions),
				is_disabled: false,
			},
			{
				onSuccess: () => {
					message.success('Mã giảm giá đã được tạo thành công');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	return {
		onSaveAsInactive,
		onSaveAsActive,
	};
};
