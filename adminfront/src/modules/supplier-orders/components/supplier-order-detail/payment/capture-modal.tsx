import { Input, InputNumber } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import Medusa from '@/services/api';
import { currencies } from '@/types/currencies';
import { SupplierOrder } from '@/types/supplier';
import { normalizeAmount, persistedPrice } from '@/utils/prices';
import { Form, message } from 'antd';
import { useEffect, useMemo } from 'react';

interface Props {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	supplierOrder: SupplierOrder;
	refetch: () => void;
}

type CaptureFormData = {
	// currency
	amount: number;
};

const getCurrencyInfo = (currencyCode?: string) => {
	if (!currencyCode) {
		return undefined;
	}
	const currencyInfo = currencies[currencyCode.toUpperCase()];
	return currencyInfo;
};

const CaptureModal = ({
	state,
	handleOk,
	handleCancel,
	supplierOrder,
	refetch,
}: Props) => {
	const [form] = Form.useForm();
	const payment = supplierOrder!.payments![0];

	const paidAble = useMemo(() => {
		return (
			payment.amount -
			payment.amount_refunded -
			((payment?.data?.paid_total as number) ?? 0)
		);
	}, [payment]);

	useEffect(() => {
		if (paidAble) {
			form.setFieldsValue({
				amount: normalizeAmount(supplierOrder.currency_code, paidAble),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paidAble]);

	const onFinish = async (values: CaptureFormData) => {
		const { amount } = values;

		await Medusa.payments
			.captureSupplierPayment(payment.id, {
				paid_total: persistedPrice(supplierOrder.currency_code, amount),
			})
			.then(async () => {
				message.success('Đã thu tiền đơn hàng thành công');
				handleOk();
				refetch();
				form.resetFields();
			})
			.catch((error) => {
				message.error(getErrorMessage(error));
			});
	};

	const handleCancelModal = () => {
		form.resetFields();
		handleCancel();
	};

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			handleCancel={handleCancelModal}
			form={form}
		>
			<Title level={3} className="text-center">
				{'Thu tiền'}
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
							defaultValue={supplierOrder.currency_code.toUpperCase()}
							className="w-[100px]"
							disabled
						/>
					</Form.Item>
					<Form.Item
						labelCol={{ span: 24 }}
						name="amount"
						label="Số tiền thu"
						rules={[
							{
								required: true,
								message: 'Vui lòng nhập số tiền thu',
							},
						]}
					>
						<InputNumber
							max={+normalizeAmount(supplierOrder.currency_code, paidAble)}
							min={1}
							allowClear
							prefix={
								<span className="text-gray-500">
									{getCurrencyInfo(supplierOrder?.currency_code)?.symbol_native}
								</span>
							}
						/>
					</Form.Item>
				</div>
			</Form>
		</SubmitModal>
	);
};

export default CaptureModal;
