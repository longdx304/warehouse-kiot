import { Col, Form, FormProps, Row, message } from 'antd';
import _ from 'lodash';
import { CircleAlert, Plus, Trash2 } from 'lucide-react';
import {
	useAdminCreateProductOption,
	useAdminDeleteProductOption,
	useAdminUpdateProductOption,
} from 'medusa-react';
import { FC, useEffect } from 'react';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { TooltipIcon } from '@/components/Tooltip';
import { Text, Title } from '@/components/Typography';
import { Product, ProductOption } from '@medusajs/medusa';

type Props = {
	product: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const OptionModal: FC<Props> = ({ state, product, handleOk, handleCancel }) => {
	const createOption = useAdminCreateProductOption(product.id);
	const updateOption = useAdminUpdateProductOption(product.id);
	const deleteOption = useAdminDeleteProductOption(product.id);
	//
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const onCancel = () => {
		const options = product.options.map((option) => ({
			title: option.title,
		}));
		form.setFieldsValue({
			options: options,
		});
		// form.resetFields();
		handleCancel();
	};

	const onFinish: FormProps<any>['onFinish'] = async (values) => {
		const { options } = values;
		const optionsProduct = product.options;
		// Create array of option ids
		const optionIds = options
			.map((option: ProductOption) => option.id)
			.filter((id: string) => id);

		const promiseUpsert = options.map((option: ProductOption) => {
			const findOption = optionsProduct.find((o) => o.id === option?.id);
			// if option not exists so create new option
			if (_.isEmpty(findOption)) {
				return createOption.mutateAsync({
					title: option.title,
				});
			} else {
				// if option exists so check if title is changed
				if (findOption.title !== option.title) {
					return updateOption.mutateAsync({
						option_id: option.id,
						title: option.title,
					});
				}
			}
		});

		const promiseDelete = optionsProduct.map((option) => {
			const isDeleteOption = !optionIds.includes(option.id);
			if (isDeleteOption) {
				return deleteOption.mutateAsync(option.id);
			}
		});

		// Combine all promises
		const combinedPromise = [...promiseUpsert, ...promiseDelete];
		Promise.all(combinedPromise)
			.then(() => {
				messageApi.success('Thao tác thành công.');
				handleOk();
			})
			.catch((e: any) => {
				messageApi.success('Có lỗi xảy ra, vui lòng thử lại sau.');
			});
	};

	useEffect(() => {
		if (product) {
			const options = product.options.map((option) => ({
				id: option.id,
				title: option.title,
			}));
			form.setFieldsValue({
				options: options,
			});
		}
	}, [form, product]);

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			isLoading={
				createOption.isLoading ||
				updateOption.isLoading ||
				deleteOption.isLoading
			}
			handleCancel={onCancel}
			width={400}
			form={form}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{`Chỉnh sửa tuỳ chọn`}
			</Title>
			<Form
				form={form}
				onFinish={onFinish}
				className="pt-3"
				// initialValues={getDefaultValues(thumbnail)}
			>
				<OptionForm form={form} />
				{/* <AddVariant form={form} product={product} /> */}
			</Form>
		</SubmitModal>
	);
};

export default OptionModal;

type OptionFormProps = {
	form: any;
};

const OptionForm: FC<OptionFormProps> = ({ form }) => {
	return (
		<Flex vertical>
			<Flex gap="4px" className="pb-2" align="center">
				<Text className="text-sm text-gray-500 font-medium">
					Tuỳ chọn sản phẩm
				</Text>
				<TooltipIcon
					title="Tuỳ chọn được sử dụng để xác định màu sắc, kích thước, v.v của sản phẩm."
					icon={<CircleAlert className="w-[16px] stroke-2" color="#E7B008" />}
				/>
			</Flex>
			<Form.List name="options">
				{(fields, { add, remove }, { errors }) => (
					<Flex vertical gap="small" className="w-full">
						{fields.length > 0 && (
							<Row gutter={[16, 16]} wrap={false}>
								<Col flex="auto">
									<Text className="text-sm text-gray-500 font-medium">
										Tiêu đề tuỳ chọn
									</Text>
								</Col>
								<Col flex="40px"></Col>
							</Row>
						)}
						{fields.map((field, index) => (
							<Row key={field.key} gutter={[16, 16]} wrap={false}>
								<Col flex="auto">
									<Form.Item
										{...field}
										rules={[
											{
												required: true,
												whitespace: true,
												message: 'Vui lòng nhập tiêu đề hoặc xoá trường này',
											},
										]}
										labelCol={{ span: 24 }}
										name={[field.name, 'title']}
										initialValue=""
										className="mb-0 text-xs"
									>
										<Input placeholder="Màu sắc, Kích thước..." />
									</Form.Item>
								</Col>
								<Col flex="40px">
									{fields.length > 0 ? (
										<div className="h-full flex items-center justify-center">
											<Trash2
												size={18}
												className="stroke-2"
												color="#FF4D4F"
												onClick={() => remove(field.name)}
											/>
										</div>
									) : null}
								</Col>
							</Row>
						))}
						<div className="w-full">
							<Form.Item>
								<Button
									type="default"
									className="w-full flex justify-center items-center"
									icon={<Plus size={20} className="stroke-2" />}
									onClick={() => add()}
								>
									Thêm một tuỳ chọn
								</Button>
							</Form.Item>
						</div>
					</Flex>
				)}
			</Form.List>
		</Flex>
	);
};
