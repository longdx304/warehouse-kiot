import { FC, useEffect } from 'react';
import { Form, Row, Col, message, FormProps } from 'antd';
import { ProductCollection } from '@medusajs/medusa';
import { CircleAlert } from 'lucide-react';
import _ from 'lodash';

import { SubmitModal } from '@/components/Modal';
import { Input } from '@/components/Input';
import {
	useAdminCreateCollection,
	useAdminUpdateCollection,
} from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	collection?: ProductCollection | null;
};

type CollectionFormProps = {
	title: string;
	handle?: string;
};

const CollectionModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	collection,
}) => {
	const [form] = Form.useForm();
	const createCollection = useAdminCreateCollection();
	const updateCollection = useAdminUpdateCollection(collection?.id || '');

	useEffect(() => {
		form.setFieldsValue({
			title: collection?.title,
			handle: collection?.handle,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collection]);

	const onFinish: FormProps<CollectionFormProps>['onFinish'] = (values) => {
		if (_.isEmpty(collection)) {
			createCollection.mutateAsync(values, {
				onSuccess: () => {
					message.success('Tạo bộ sưu tập thành công.');
					handleOk();
					form.resetFields();
					return;
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
					return;
				},
			});
			return;
		}
		updateCollection.mutateAsync(values, {
			onSuccess: () => {
				message.success('Chỉnh sửa bộ sưu tập thành công.');
				handleOk();
				form.resetFields();
				return;
			},
			onError: (error) => {
				message.error(getErrorMessage(error));
				return;
			},
		});
	};

	return (
		<SubmitModal
			title={collection ? 'Chỉnh sửa bộ sưu tập' : 'Tạo bộ sưu tập'}
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={createCollection?.isLoading || updateCollection?.isLoading}
			form={form}
		>
			<Form form={form} onFinish={onFinish}>
				<Row gutter={[16, 8]} className="pt-4">
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="title"
							label="Tên bộ sưu tập"
							className="mb-2"
							rules={[
								{
									required: true,
									message: 'Tên bộ sưu tập phải có ít nhất 1 ký tự.',
								},
							]}
						>
							<Input placeholder="Giày Nam" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="handle"
							label="Tiêu đề URL"
							rules={[
								{
									pattern: /^[A-Za-z0-9-_]+$/,
									message: 'Url không được có dấu hoặc khoảng trắng.',
								},
							]}
							tooltip={{
								title:
									'URL Slug cho bộ sưu tập. Sẽ được tự động tạo nếu để trống',
								icon: <CircleAlert size={18} />,
							}}
							className="mb-2"
						>
							<Input
								prefix={<span className="text-gray-300">{'/'}</span>}
								placeholder="giay-nam"
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default CollectionModal;
