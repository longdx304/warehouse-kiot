import { SubmitModal } from '@/components/Modal';
import { Discount } from '@medusajs/medusa';
import { Form, message } from 'antd';
import General from '../../discount-form/section/discount-general';
import { useDiscountForm } from '../../discount-form/discount-form-context';
import { useEffect } from 'react';
import { AllocationType, DiscountRuleType } from '@/types/discount';
import { useAdminUpdateDiscount } from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';

type EditGeneralProps = {
	discount: Discount;
	open: boolean;
	onClose: () => void;
};

type GeneralForm = {
	code: string;
	rule: {
		value: number;
		description: string;
		type: DiscountRuleType;
		allocation: AllocationType;
	};
	is_dynamic: boolean;
	valid_duration: string | null;
	regions?: string;
};

const EditGeneral = ({ discount, open, onClose }: EditGeneralProps) => {
	const { form } = useDiscountForm();
	const { mutate, isLoading } = useAdminUpdateDiscount(discount.id);

	const onFinish = async (values: GeneralForm) => {
		mutate(
			{
				regions: [values.regions as string],
				code: values.code,
				rule: {
					id: discount.rule.id,
					description: values.rule.description,
					value: values.rule.value,
					allocation: discount.rule.allocation,
				},
			},
			{
				onSuccess: () => {
					message.success('Cập nhật thông tin thành công.');
					onClose();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	useEffect(() => {
		form.setFieldsValue({
			code: discount.code,
			regions: discount.regions.map((r) => r.id)[0],
			is_dynamic: discount.is_dynamic,
			rule: {
				type: discount.rule.type,
				value: discount.rule.value,
				description: discount.rule.description,
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discount]);
	return (
		<SubmitModal
			title="Chỉnh sửa thông tin chung"
			open={open}
			handleCancel={onClose}
			form={form}
			isLoading={isLoading}
		>
			<Form form={form} onFinish={onFinish}>
				<General discount={discount} />
			</Form>
		</SubmitModal>
	);
};

export default EditGeneral;
