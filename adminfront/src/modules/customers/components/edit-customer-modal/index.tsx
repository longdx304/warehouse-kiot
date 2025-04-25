import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/utils';
import { Customer } from '@medusajs/medusa';
import { Col, Form, Row, message } from 'antd';
import { useAdminUpdateCustomer } from 'medusa-react';
import { FC, useEffect } from 'react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	customer: Customer;
};

type CustomerFormProps = {
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
};

const EditCustomerModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	customer,
}) => {
	const [form] = Form.useForm();
	const updateCustomer = useAdminUpdateCustomer(customer.id);

	useEffect(() => {
		form.setFieldsValue({
			email: customer?.email,
			first_name: customer?.first_name,
			last_name: customer?.last_name,
			phone: customer?.phone,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customer]);

	const onFinish = async (values: CustomerFormProps) => {
		await updateCustomer.mutateAsync(
			{
				first_name: values.first_name,
				last_name: values.last_name,
				phone: values?.phone || undefined,
			},
			{
				onSuccess: () => {
					message.success('Cập nhật thông tin khách hàng thành công');
					handleOk();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	return (
		<SubmitModal
			title="Chỉnh sửa thông tin khách hàng"
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={updateCustomer.isLoading}
			form={form}
		>
			<Form form={form} onFinish={onFinish}>
				<Row gutter={[16, 8]} className="pt-4">
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="first_name"
							label="Tên"
							rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
						>
							<Input placeholder="Tên" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="last_name"
							label="Họ"
							rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
						>
							<Input placeholder="Họ" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item labelCol={{ span: 24 }} name="email" label="Email">
							<Input disabled />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="phone"
							label="Số điện thoại"
							rules={[
								{ min: 10, message: 'Số điện thoại ít nhất phải 10 chữ số' },
								{
									type: 'number',
									message: 'Số điện thoại không hợp lệ',
								},
							]}
						>
							<Input placeholder="0987654321" />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default EditCustomerModal;
