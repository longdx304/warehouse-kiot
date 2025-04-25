import { Input, TextArea } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { ReturnReason } from '@medusajs/medusa';
import { Col, Form, message, Row } from 'antd';
import _ from 'lodash';
import {
	useAdminCreateReturnReason,
	useAdminUpdateReturnReason,
} from 'medusa-react';
import { FC, useEffect } from 'react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	returnReason: ReturnReason;
};

type CreateReturnReasonFormData = {
	value: string;
	label: string;
	description: string | null;
};

const ReasonModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	returnReason,
}) => {
	const [form] = Form.useForm();
	const updateReason = useAdminUpdateReturnReason(returnReason?.id || '');
	const createReason = useAdminCreateReturnReason();

	const isCreate = _.isEmpty(returnReason);

	useEffect(() => {
		if (!isCreate && returnReason) {
			form.setFieldsValue({
				value: returnReason.value,
				label: returnReason.label,
				description: returnReason.description,
			});
		} else {
			form.resetFields();
		}
	}, [returnReason, isCreate, form]);

	const onFinish = async (values: CreateReturnReasonFormData) => {
		try {
			if (isCreate) {
				await createReason.mutateAsync({
					...values,
					description: values.description || undefined,
				});
				message.success('Tạo mới lý do trả hàng thành công');
			} else {
				await updateReason.mutateAsync({
					...values,
					description: values.description || undefined,
				});
				message.success('Cập nhật lý do trả hàng thành công');
			}
			handleOk();
		} catch (error) {
			message.error('Không thể tạo lý do trả hàng với giá trị đã tồn tại');
		}
	};

	return (
		<SubmitModal
			title={isCreate ? 'Thêm lý do' : 'Chỉnh sửa lý do'}
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={createReason.isLoading || updateReason.isLoading}
			form={form}
		>
			<Form form={form} onFinish={onFinish}>
				<Row gutter={[16, 8]} className="pt-4">
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="value"
							label="Giá trị"
							rules={[
								{ required: true, message: 'Vui lòng nhập giá trị' },
								{
									whitespace: true,
									message: 'Giá trị không được chỉ chứa khoảng trắng',
								},
								{ min: 1, message: 'Giá trị phải có ít nhất 1 ký tự' },
							]}
						>
							<Input placeholder="wrong_size" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="label"
							label="Nhãn"
							rules={[
								{ required: true, message: 'Vui lòng nhập nhãn' },
								{
									whitespace: true,
									message: 'Nhãn không được chỉ chứa khoảng trắng',
								},
								{ min: 1, message: 'Nhãn phải có ít nhất 1 ký tự' },
							]}
						>
							<Input placeholder="Wrong size" />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item labelCol={{ span: 24 }} name="description" label="Mô tả">
							<TextArea
								rows={3}
								placeholder="Khách hàng nhận được sai kích cỡ"
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default ReasonModal;
