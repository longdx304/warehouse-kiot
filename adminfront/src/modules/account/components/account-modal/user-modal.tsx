'use client';
import { Form, message, type FormProps } from 'antd';
import { Mail, Phone, UserRound } from 'lucide-react';
import { useEffect } from 'react';

// import { createUser, updateUser } from '@/actions/accounts';
import { CheckboxGroup } from '@/components/Checkbox';
import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import {
	EPermissions,
	IAdminResponse,
	IUserRequest,
	rolesEmployee,
} from '@/types/account';
import isEmpty from 'lodash/isEmpty';
import { useAdminCreateUser, useAdminUpdateUser } from 'medusa-react';

interface Props {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	user: IAdminResponse | null;
}

export default function UserModal({
	state: stateModal,
	handleOk,
	handleCancel,
	user,
}: Props) {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();
	const createUser = useAdminCreateUser();
	const updateUser = useAdminUpdateUser(user?.id ?? '');

	const titleModal = `${isEmpty(user) ? 'Thêm mới' : 'Cập nhật'} nhân viên`;

	useEffect(() => {
		form?.setFieldsValue({
			email: user?.email ?? '',
			phone: user?.phone ?? '',
			fullName: user?.first_name ?? '',
			permissions: user?.permissions?.split(',') ?? [
				EPermissions.Warehouse,
				EPermissions.Manager,
				EPermissions.Driver,
				EPermissions.Accountant,
			],
		});
	}, [user, form]);

	const createPayload = (values: IUserRequest) => {
		const { email, fullName, phone, permissions } = values;

		return {
			email,
			password: '123456',
			first_name: fullName,
			phone,
			permissions: permissions.join(','),
		};
	};

	// Submit form
	const onFinish: FormProps<IUserRequest>['onFinish'] = async (values) => {
		// Create user
		if (isEmpty(user)) {
			const payload = createPayload(values);
			createUser.mutateAsync(payload, {
				onSuccess: () => {
					message.success('Đăng ký nhân viên thành công');
					handleCancel();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			});
		} else {
			// Update user
			const payload = {
				first_name: values.fullName,
				phone: values.phone,
				permissions: values.permissions.join(','),
			};
			updateUser.mutateAsync(payload, {
				onSuccess: () => {
					message.success('Chỉnh sửa nhân viên thành công');
					handleCancel();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			});
		}
	};

	return (
		<SubmitModal
			open={stateModal}
			onOk={handleOk}
			isLoading={createUser?.isLoading || updateUser?.isLoading}
			handleCancel={handleCancel}
			form={form}
		>
			<Title level={3} className="text-center">
				{titleModal}
			</Title>
			<Form id="form-user" form={form} onFinish={onFinish}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="email"
					rules={[
						{ required: true, message: 'Email bắt buộc phải có ký tự.' },
						{ type: 'email', message: 'Email không đúng định dạng!' },
					]}
					label="Email:"
				>
					<Input
						placeholder="Email"
						prefix={<Mail />}
						disabled={!isEmpty(user)}
						data-testid="email"
					/>
				</Form.Item>
				<Form.Item
					labelCol={{ span: 24 }}
					name="fullName"
					rules={[{ required: true, message: 'Tên phải có ít nhất 2 ký tự!' }]}
					label="Tên nhân viên:"
				>
					<Input
						placeholder="Tên nhân viên"
						prefix={<UserRound />}
						data-testid="fullName"
					/>
				</Form.Item>
				<Form.Item
					labelCol={{ span: 24 }}
					name="phone"
					rules={[
						{
							required: true,
							message: 'Số điện thoại bắt buộc phải có ký tự.',
						},
						{ min: 10, message: 'Số điện thoại phải có ít nhất 10 chữ số.' },
					]}
					label="Số diện thoại:"
				>
					<Input
						placeholder="Số điện thoại"
						prefix={<Phone />}
						data-testid="phone"
					/>
				</Form.Item>
				<Form.Item
					labelCol={{ span: 24 }}
					label="Phân quyền nhân viên"
					name="permissions"
					rules={[
						{ required: true, message: 'Nhân viên phải có ít nhất 1 vai trò!' },
					]}
				>
					<CheckboxGroup data-testid="permissions" options={rolesEmployee} />
				</Form.Item>
			</Form>
		</SubmitModal>
	);
}
