import { useContext, useState } from 'react';
import { useDiscountForm } from '../../discount-form/discount-form-context';
import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { Button } from '@/components/Button';
import { Form, message } from 'antd';
import { DiscountFormValues } from '@/types/discount';
import DiscoutForm from '../../discount-form';
import { useFormActions } from '../../discount-form/use-form-actions';

type AddDiscountModalProps = {
	state: boolean;
	handleCancel: () => void;
};
const AddDiscountModal: React.FC<AddDiscountModalProps> = ({
	state,
	handleCancel,
}) => {
	const { form, handleReset } = useDiscountForm();
	const layeredModalContext = useContext(LayeredModalContext);
	const [isActiveSubmit, setIsActiveSubmit] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const { onSaveAsActive, onSaveAsInactive } = useFormActions();

	const isTypingForm = (values: DiscountFormValues) => {
		const { rule, code, regions } = values;
		if (rule?.value || rule?.description || code || regions) return true;
		return false;
	};

	// reset form
	const onCancel = () => {
		handleReset();
		handleCancel();
	};

	// Handle submit form
	const onFinish = async (values: DiscountFormValues) => {
		if (!isTypingForm(values)) {
			message.warning('Bạn chưa nhập đầy đủ thông tin');
			return;
		}
		setIsSubmitting(true);
		if (isActiveSubmit) {
			await onSaveAsActive(values);
		} else {
			await onSaveAsInactive(values);
		}
		setIsSubmitting(false);
		onCancel();
	};

	// Modal: Render footer buttons
	const footer = (
		<div className="flex items-center justify-end gap-2">
			<Button
				onClick={onCancel}
				loading={isSubmitting}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Hủy
			</Button>
			<Button
				type="default"
				className="text-sm min-w-32 justify-center"
				loading={isSubmitting}
				onClick={() => {
					form.submit();
					setIsActiveSubmit(false);
				}}
			>
				Lưu nháp
			</Button>
			<Button
				className="text-sm min-w-32 justify-center"
				loading={isSubmitting}
				onClick={() => {
					form.submit();
					setIsActiveSubmit(true);
				}}
			>
				Xuất bản giảm giá
			</Button>
		</div>
	);

	return (
		<LayeredModal
			context={layeredModalContext}
			onCancel={onCancel}
			open={state}
			footer={footer}
			title="Thêm mã giảm giá"
			className="layered-modal"
			width={800}
		>
			<Form form={form} onFinish={onFinish}>
				<DiscoutForm closeForm={onCancel} />
			</Form>
		</LayeredModal>
	);
};

export default AddDiscountModal;
