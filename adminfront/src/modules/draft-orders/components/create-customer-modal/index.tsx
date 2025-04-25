import React from 'react';
import { Form, Input, Modal } from 'antd';
import { useAdminCreateCustomer } from 'medusa-react';
import { Button } from '@/components/Button';

type Props = {
	visible: boolean;
	onClose: () => void;
	onCustomerCreated: (customer: any) => void;
	totalCustomers: number;
};

const CreateCustomerModal = ({
	visible,
	onClose,
	onCustomerCreated,
	totalCustomers,
}: Props) => {
	const [form] = Form.useForm();
	const createCustomer = useAdminCreateCustomer();

	const handleSubmit = async (values: any) => {
		try {
			await createCustomer.mutate(
				{
					email: values?.email || `customer_${totalCustomers + 1}@example.com`,
					first_name: values.first_name,
					last_name: values.last_name,
					password: values.password,
					phone: values.phone,
				},
				{
					onSuccess: ({ customer }) => {
						onCustomerCreated({
							id: customer.id,
							first_name: customer.first_name,
							last_name: customer.last_name,
							email: customer.email,
						});
						form.resetFields();
						onClose();
					},
				}
			);
		} catch (error) {
			console.error('Error creating customer:', error);
		}
	};

	return (
		<Modal
			title="Tạo khách hàng mới"
			open={visible}
			onCancel={onClose}
			footer={null}
		>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					name="email"
					label="Email"
					rules={[
						// { required: true, message: 'Vui lòng nhập email' },
						{ type: 'email', message: 'Email không hợp lệ' },
					]}
				>
					<Input placeholder="example@email.com" />
				</Form.Item>

				<Form.Item
					name="first_name"
					label="Tên"
					rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
				>
					<Input placeholder="Nhập tên" />
				</Form.Item>

				<Form.Item
					name="last_name"
					label="Họ"
					rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
				>
					<Input placeholder="Nhập họ" />
				</Form.Item>

				<Form.Item
					name="password"
					label="Mật khẩu"
					rules={[
						{ required: true, message: 'Vui lòng nhập mật khẩu' },
						{ min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
					]}
				>
					<Input.Password placeholder="Nhập mật khẩu" />
				</Form.Item>

				<Form.Item name="phone" label="Số điện thoại">
					<Input placeholder="Nhập số điện thoại" />
				</Form.Item>

				<div className="flex justify-end gap-x-2">
					<Button type="default" onClick={onClose}>
						Hủy
					</Button>
					<Button htmlType="submit" loading={createCustomer.isLoading}>
						Tạo khách hàng
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

export default CreateCustomerModal;
