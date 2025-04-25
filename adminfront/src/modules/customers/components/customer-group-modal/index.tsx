import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/utils';
import { CustomerGroup } from '@medusajs/medusa';
import { Form, message } from 'antd';
import {
	useAdminCreateCustomerGroup,
	useAdminUpdateCustomerGroup,
} from 'medusa-react';
import { FC, useEffect } from 'react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	customerGroup: CustomerGroup | null;
};

type CustomerGroupFormProps = {
	name: string;
};

const CustomerGroupModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	customerGroup,
}) => {
	const [form] = Form.useForm();
	const createCustomerGroup = useAdminCreateCustomerGroup();
	const updateCustomerGroup = useAdminUpdateCustomerGroup(
		customerGroup?.id || ''
	);

	useEffect(() => {
		if (customerGroup) {
			form.setFieldsValue({
				name: customerGroup?.name,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customerGroup]);

	const onFinish = async (values: CustomerGroupFormProps) => {
		if (customerGroup) {
			await updateCustomerGroup.mutateAsync(
				{
					name: values.name,
				},
				{
					onSuccess: () => {
						message.success('Cập nhật thông tin thành công.');
						handleOk();
					},
					onError: (error) => {
						message.error(getErrorMessage(error));
					},
				}
			);
			return;
		}
		await createCustomerGroup.mutateAsync(
			{
				name: values.name,
			},
			{
				onSuccess: () => {
					message.success('Tạo nhóm khách hàng thành công.');
					handleOk();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
		return;
	};

	return (
		<SubmitModal
			title={
				customerGroup ? 'Chỉnh sửa nhóm khách hàng' : 'Tạo nhóm khách hàng'
			}
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={
				createCustomerGroup?.isLoading || updateCustomerGroup?.isLoading
			}
			form={form}
		>
			<Form form={form} onFinish={onFinish}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="name"
					label="Tên nhóm khách hàng"
					rules={[
						{
							required: true,
							message: 'Vui lòng nhập tên nhóm khách hàng',
						},
					]}
				>
					<Input placeholder="Tên Nhóm" data-testid="input-name" />
				</Form.Item>
			</Form>
		</SubmitModal>
	);
};

export default CustomerGroupModal;
