import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { Divider, Form, FormProps, message } from 'antd';
import { useAdminUpdateOrder } from 'medusa-react';
import { FC, useEffect } from 'react';

type EmailModalProps = {
	email: string;
	orderId: string;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

type EmailModalFormData = {
	email: string;
};

const EmailModal: FC<EmailModalProps> = ({
	email,
	orderId,
	state,
	handleOk,
	handleCancel,
}) => {
	const [form] = Form.useForm<EmailModalFormData>();
	const updateEmail = useAdminUpdateOrder(orderId);

	/**
	 * Handles the form submission and updates the email asynchronously.
	 *
	 * @param {EmailModalFormData} values - The form values containing the email.
	 * @return {Promise<void>} A promise that resolves when the email update is successful.
	 */
	const onFinish: FormProps<EmailModalFormData>['onFinish'] = async (
		values
	) => {
		try {
			await updateEmail.mutateAsync(values, {
				onSuccess: () => {
					message.success('Cập nhật email thành công');
					handleOk();
					form.resetFields();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			});
		} catch (error) {
			console.log('error', error);
		}
	};
	const handleCancelModal = () => {
		form.resetFields();
		handleCancel();
	};

	useEffect(() => {
		if (email) {
			form.setFieldsValue({ email: email });
		}
	}, [email, form]);

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			handleCancel={handleCancelModal}
			form={form}
			width={700}
			isLoading={updateEmail.isLoading}
		>
			<Title level={3} className="text-center">
				Địa chỉ email
			</Title>
			<Divider className="my-2" />
			<Form form={form} onFinish={onFinish} className="pt-4">
				<Form.Item
					labelCol={{ span: 24 }}
					name="email"
					label="Email"
					rules={[
						{
							required: true,
							message: 'Vui lý nhập email',
						},
						{
							type: 'email',
							message: 'Vui lòng nhập đúng format email',
						},
					]}
					initialValue={email}
				>
					<Input placeholder="Email" />
				</Form.Item>
			</Form>
		</SubmitModal>
	);
};

export default EmailModal;
