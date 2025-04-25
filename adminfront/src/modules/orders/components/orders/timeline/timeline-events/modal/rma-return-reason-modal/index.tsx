import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Title } from '@/components/Typography';
import { Form, FormProps } from 'antd';
import { useAdminReturnReasons } from 'medusa-react';
import { useEffect, useState } from 'react';

type Props = {
	initValue?: any;
	state: boolean;
	onClose: () => void;
	onSubmit: (params: { reason?: any; note?: string }) => void;
	isClaim?: boolean;
};

const claimReturnReasons = [
	{
		label: 'Sản phẩm bị thiếu',
		value: 'missing_item',
	},
	{
		label: 'Sản phẩm bị lỗi',
		value: 'wrong_item',
	},
	{
		label: 'Lỗi sản xuất',
		value: 'production_failure',
	},
	{
		label: 'Khác',
		value: 'other',
	},
];

const ReturnReasonModal = ({
	initValue,
	state,
	onClose,
	onSubmit,
	isClaim = false,
}: Props) => {
	const [selectedReason, setSelectedReason] = useState<any>(null);

	const [form] = Form.useForm();

	useEffect(() => {
		if (initValue) {
			setSelectedReason(initValue.reason);
			form.setFieldsValue({
				reason: initValue.reason?.value,
				note: initValue?.note,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initValue]);
	const handleReasonChange = (
		value: string,
		valueOption: { label: string; value: string }
	) => {
		setSelectedReason(valueOption);
	};
	const { return_reasons, isLoading } = useAdminReturnReasons();

	const onFinish: FormProps<{
		reason?: any;
		note?: string;
	}>['onFinish'] = async (values) => {
		onSubmit({ reason: selectedReason, note: values.note });
		onClose();
	};

	const options = isClaim
		? claimReturnReasons
		: return_reasons?.map((reason) => ({
				label: reason.label,
				value: reason.id,
			}));

	return (
		<SubmitModal
			open={state}
			// isLoading={submitting}
			// disabled={submitting}
			handleCancel={onClose}
			form={form}
		>
			<Title level={3} className="text-center">
				{'Lý do trả hàng'}
			</Title>
			<Form form={form} onFinish={onFinish}>
				<Form.Item labelCol={{ span: 24 }} name="reason" label="Lý do:">
					<Select
						onChange={handleReasonChange as any}
						loading={isLoading}
						options={options}
						placeholder="Chọn một lý do"
					/>
				</Form.Item>
				<Form.Item labelCol={{ span: 24 }} name="note" label="Ghi chú:">
					<Input placeholder="Ghi chú..." />
				</Form.Item>
			</Form>
		</SubmitModal>
	);
};

export default ReturnReasonModal;
