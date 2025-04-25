import { Input, InputNumber, TextArea } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { currencies } from '@/types/currencies';
import { normalizeAmount, persistedPrice } from '@/utils/prices';
import { Order } from '@medusajs/medusa';
import { Form, message } from 'antd';
import { useAdminRefundPayment } from 'medusa-react';
import { useEffect, useMemo } from 'react';

interface Props {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	order: Order;
	initialAmount?: number;
	initialReason?: string;
	refetch: () => void;
}

type RefundMenuFormData = {
	// currency
	amount: number;
	reason: string;
	note?: string;
};

const getCurrencyInfo = (currencyCode?: string) => {
	if (!currencyCode) {
		return undefined;
	}
	const currencyInfo = currencies[currencyCode.toUpperCase()];
	return currencyInfo;
};

const RefundModal = ({
	state,
	handleOk,
	handleCancel,
	order,
	initialAmount = 1000,
	initialReason = 'discount',
	refetch,
}: Props) => {
	const [form] = Form.useForm();
	const { mutateAsync, isLoading } = useAdminRefundPayment(order.id);

	const refundable = useMemo(() => {
		return order.paid_total - order.refunded_total;
	}, [order]);

	useEffect(() => {
		if (initialAmount || initialReason) {
			form.setFieldsValue({
				amount: normalizeAmount(order.currency_code, initialAmount),
				reason: initialReason || 'discount',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialAmount, initialReason]);

	const onFinish = async (values: RefundMenuFormData) => {
		await mutateAsync(
			{
				amount: persistedPrice(order.currency_code, values.amount),
				reason: values.reason,
				no_notification: true,
				note: values?.note ?? '',
			},
			{
				onSuccess: () => {
					message.success('Đã hoàn tiền đơn hàng thành công');
					handleOk();
					refetch();
					form.resetFields();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const handleCancelModal = () => {
		form.resetFields();
		handleCancel();
	};

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			isLoading={isLoading}
			handleCancel={handleCancelModal}
			form={form}
		>
			<Title level={3} className="text-center">
				{'Tạo đơn hoàn tiền'}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-4">
				<div className="flex gap-4">
					<Form.Item
						labelCol={{ span: 24 }}
						// name="currency"
						label="Tiền tệ"
						className="w-[100px]"
					>
						<Input
							defaultValue={order.currency_code.toUpperCase()}
							className="w-[100px]"
							disabled
						/>
					</Form.Item>
					<Form.Item
						labelCol={{ span: 24 }}
						name="amount"
						label="Số tiền hoàn trả"
						rules={[
							{
								required: true,
								message: 'Vui lòng nhập số tiền hoàn trả',
							},
							// () => ({
							// 	validator(_, value) {
							// 		if (!value) {
							// 			return Promise.reject();
							// 		}
							// 		if (value > refundable) {
							// 			return Promise.reject("Số tiền hoàn trả không thể lớn hơn số tiền cần thành toán");
							// 		}
							// 		return Promise.resolve();
							// 	},
							// }),
						]}
					>
						<InputNumber
							max={+normalizeAmount(order.currency_code, refundable)}
							min={
								initialAmount
									? +normalizeAmount(order.currency_code, initialAmount)
									: 1
							}
							allowClear
							prefix={
								<span className="text-gray-500">
									{getCurrencyInfo(order?.currency_code)?.symbol_native}
								</span>
							}
						/>
					</Form.Item>
				</div>
				<Form.Item
					labelCol={{ span: 24 }}
					name="reason"
					label="Lý do"
					initialValue={initialReason}
				>
					<Select
						options={[
							{ value: 'discount', label: 'Giảm giá' },
							{ value: 'other', label: 'Khác' },
						]}
					/>
				</Form.Item>
				<Form.Item labelCol={{ span: 24 }} name="note" label="Ghi chú">
					<TextArea placeholder="Giảm giá cho khách hàng thân thiết" />
				</Form.Item>
			</Form>
		</SubmitModal>
	);
};

export default RefundModal;
