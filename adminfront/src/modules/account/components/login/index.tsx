'use client';

import { Lock, LogIn, Mail } from 'lucide-react';

import { setCookie } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input, InputPassword } from '@/components/Input';
import { cn } from '@/lib/utils';
import { ERoutes } from '@/types/routes';
import { Form, FormProps, message } from 'antd';
import { useAdminLogin, useMedusa } from 'medusa-react';
import { useRouter } from 'next/navigation';

type FormValues = {
	email: string;
	password: string;
};

type LoginTemplateProps = {};

const LoginTemplate = ({}: LoginTemplateProps) => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();
	const { client } = useMedusa();

	const { mutateAsync, isLoading } = useAdminLogin();

	const onFinish: FormProps<FormValues>['onFinish'] = async (values) => {
		mutateAsync(values, {
			onSuccess: async (data) => {
				await client.admin.auth
					.getToken(values)
					.then(async ({ access_token }) => {
						await setCookie(access_token);
					});
				message.success('Đăng nhập thành công!');
				router.push(ERoutes.DASHBOARD);
			},
			onError: () => {
				message.error('Đăng nhập thất bại!');
			},
		});
	};

	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center fixed w-full h-full',
				'sm:justify-between sm:py-32 sm:relative'
			)}
		>
			{contextHolder}
			<Card
				className="[&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:justify-start [&_.ant-card-body]:gap-4"
				bordered={true}
			>
				<div className="text-2xl text-center font-bold">Đăng nhập</div>
				<Form
					id="form-user"
					form={form}
					onFinish={onFinish}
				>
					<Form.Item
						labelCol={{ span: 24 }}
						name="email"
						rules={[
							{ type: 'email', message: 'Email không đúng định dạng!' },
							{
								required: true,
								whitespace: true,
								message: 'Email phải được nhập!',
							},
						]}
						label="Email:"
					>
						<Input
							placeholder="Email"
							prefix={<Mail size={20} color="rgb(156 163 175)" />}
							data-testid="email"
						/>
					</Form.Item>
					<Form.Item
						labelCol={{ span: 24 }}
						name="password"
						rules={[
							{ required: true, message: 'Mật khẩu phải có ít nhất 2 ký tự!' },
						]}
						label="Mật khẩu:"
					>
						<InputPassword
							placeholder="Mật khẩu"
							prefix={<Lock size={20} color="rgb(156 163 175)" />}
							data-testid="password"
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							icons={<LogIn color="white" />}
							className="flex items-center justify-center w-full"
							loading={isLoading}
							data-testid="submitBtn"
						>
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default LoginTemplate;
