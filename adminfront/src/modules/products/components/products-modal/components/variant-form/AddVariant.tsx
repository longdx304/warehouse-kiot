import { Col, Form, Row } from 'antd';
import { CircleAlert, CircleCheck, Plus, Trash2 } from 'lucide-react';
import { FC, useMemo } from 'react';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input, InputNumber } from '@/components/Input';
import { Select } from '@/components/Select';
import { TooltipIcon } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import AddVariantModal from './AddVariantModal';
import { useStoreData } from '@/modules/regions/components/region-modal/use-store-data';

interface Props {
	form: any;
}

const AddVariant: FC<Props> = ({ form }) => {
	const { currencyOptions } = useStoreData();
	const options = Form.useWatch('options', form) || undefined;

	/**
	 * Determines if the "Add Variant" button should be disabled based on the options.
	 * The button will be disabled if any of the following conditions are met:
	 * - The options title is empty.
	 * - Any of the options have no values.
	 *
	 * @returns {boolean} True if the button should be disabled, false otherwise.
	 */
	const disabledBtnAddVariant = useMemo(() => {
		if (options?.length > 0) {
			return options.some(
				(option: any) => !option?.title || option?.values?.length === 0
			);
		}
		return true;
	}, [options]);

	return (
		<Row gutter={[16, 8]}>
			<Col span={24}>
				<Flex vertical>
					<span className="text-gray-500">
						{'Thêm giá tiền bán và nhập hàng mặc định.'}
					</span>
					<span className="text-gray-500">
						{
							'Cung cấp cho khách hàng khách hàng giá tiền bán và cung cấp cho quản lý giá tiền nhập hàng.'
						}
					</span>
				</Flex>
				<Row gutter={[16, 8]}>
					<Col xs={24} sm={8}>
						<Form.Item
							labelCol={{ span: 24 }}
							name={['defaultPrice', 'currency_code']}
							label="Tiền tệ:"
							initialValue={'vnd'}
						>
							<Select placeholder="Chọn tiền tệ" options={currencyOptions} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={8}>
						<Form.Item
							labelCol={{ span: 24 }}
							name={'allowed_quantity'}
							label="Định lượng đôi mặc định:"
							initialValue={6}
						>
							<InputNumber min={1} allowClear placeholder="6" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={8}>
						<Form.Item
							labelCol={{ span: 24 }}
							name={['defaultPrice', 'amount']}
							label="Tiền bán mặc định:"
						>
							<InputNumber min={1} allowClear placeholder="30,000" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={8}>
						<Form.Item
							labelCol={{ span: 24 }}
							name={['defaultPrice', 'supplier_price']}
							label="Tiền nhập mặc định:"
						>
							<InputNumber min={1} allowClear placeholder="30,000" />
						</Form.Item>
					</Col>
				</Row>
			</Col>
			<Col span={24}>
				<Flex vertical>
					<span className="text-gray-500">
						{'Thêm các biến thể của sản phẩm này.'}
					</span>
					<span className="text-gray-500">
						{
							'Cung cấp cho khách hàng của bạn các tùy chọn khác nhau cho màu sắc, định dạng, kích thước, hình dạng, v.v.'
						}
					</span>
				</Flex>
			</Col>
			{/* Product add options */}
			<Col span={24}>
				<Flex gap="4px" className="pb-2" align="center">
					<Text className="text-sm text-gray-500 font-medium">
						Tuỳ chọn sản phẩm
					</Text>
					<TooltipIcon
						title="Tuỳ chọn được sử dụng để xác định màu sắc, kích thước, v.v của sản phẩm."
						icon={<CircleAlert className="w-[16px] stroke-2" color="#E7B008" />}
					/>
				</Flex>
				<AddOptions form={form} />
			</Col>
			{/* Product add variants */}
			<Col span={24}>
				<Flex gap="4px" className="pb-2" align="center">
					<Text className="text-sm text-gray-500 font-medium">
						Các biến thể sản phẩm
					</Text>
					<TooltipIcon
						title="Bạn phải thêm ít nhất một tùy chọn sản phẩm trước khi bạn có thể bắt đầu thêm các phiên bản sản phẩm."
						icon={<CircleAlert className="w-[16px] stroke-2" color="#E7B008" />}
					/>
				</Flex>
				{/* Add Version */}
				<AddVersions
					form={form}
					disabledBtnAddVariant={disabledBtnAddVariant}
				/>
			</Col>
		</Row>
	);
};

export default AddVariant;

type AddOptionsProps = {
	form: any;
};

const AddOptions: FC<AddOptionsProps> = ({ form }) => {
	return (
		<Form.List name="options">
			{(fields, { add, remove }, { errors }) => (
				<Flex vertical gap="small" className="w-full">
					{fields.length > 0 && (
						<Row gutter={[16, 16]} wrap={false}>
							<Col span={6}>
								<Text className="text-sm text-gray-500 font-medium">
									Tiêu đề tuỳ chọn
								</Text>
							</Col>
							<Col flex="auto">
								<Text className="text-sm text-gray-500 font-medium">
									Biến thể (phân tách bằng dấu phẩy)
								</Text>
							</Col>
							<Col flex="40px"></Col>
						</Row>
					)}
					{fields.map((field, index) => (
						<Row key={field.key} gutter={[16, 16]} wrap={false}>
							<Col span={6}>
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
							<Col flex="auto">
								<Form.Item
									{...field}
									rules={[
										{
											required: true,
											type: 'array',
											message: 'Vui lòng nhập tiêu đề hoặc xoá trường này',
										},
									]}
									labelCol={{ span: 24 }}
									name={[field.name, 'values']}
									className="mb-0 text-xs"
									initialValue={[]}
								>
									<Select
										size="large"
										mode="tags"
										placeholder="Xanh, Đỏ, Đen, S, M, L..."
										style={{ width: '100%' }}
										tokenSeparators={[',']}
									/>
								</Form.Item>
							</Col>
							<Col flex="40px">
								{fields.length > 0 ? (
									<div className="h-full">
										<Button
											type="text"
											danger
											icon={<Trash2 size={18} className="stroke-2" />}
											onClick={() => remove(field.name)}
											className="h-[46px]"
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
	);
};

type AddVersionProps = {
	form: any;
	disabledBtnAddVariant: boolean;
};

const AddVersions: FC<AddVersionProps> = ({ form, disabledBtnAddVariant }) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const variants = Form.useWatch('variants', form) || undefined;
	const defaultPrice = Form.useWatch('defaultPrice', form) || undefined;
	const allowed_quantity = Form.useWatch('allowed_quantity', form) || undefined;

	const onOpenModal = (add: any) => {
		add({
			supplier_price: defaultPrice?.supplier_price,
			allowed_quantity: allowed_quantity,
			prices: [
				{
					amount: defaultPrice?.amount,
					currency_code: defaultPrice?.currency_code,
				},
			],
		});
		onOpen();
	};

	return (
		<Form.List name="variants">
			{(fields, { add, remove }, { errors }) => (
				<Flex vertical gap="small" className="w-full">
					{fields.length > 0 && (
						<Row gutter={[16, 16]} wrap={false}>
							<Col flex="200px">
								<Text className="text-sm text-gray-500 font-medium">
									Biến thể
								</Text>
							</Col>
							<Col flex="auto">
								<Text className="text-sm text-gray-500 font-medium">SKU</Text>
							</Col>
							<Col flex="40px"></Col>
						</Row>
					)}
					{fields.map((field, index) => {
						return (
							<Row
								key={field.key}
								gutter={[16, 16]}
								wrap={false}
								align="middle"
							>
								<Col flex="200px">
									{variants[index]?.title && (
										<Flex vertical gap="2px" justify="center">
											<Flex>
												<Text
													tooltip
													className="text-sm text-black font-medium line-clamp-1"
												>
													{variants[index]?.title}
												</Text>
												<Text className="text-xs">{''}</Text>
											</Flex>
										</Flex>
									)}
								</Col>
								<Col flex="auto">
									<Text
										className="text-sm text-black font-medium line-clamp-1"
										tooltip
									>
										{variants[index]?.sku ? variants[index]?.sku : '-'}
									</Text>
								</Col>
								{/* <Col flex="40px">
									{variants[index]?.inventory_quantity ? (
										<TooltipIcon
											title={`${variants[index]?.title} là phiên bản hợp lệ.`}
											icon={
												<CircleCheck
													size={18}
													color="rgb(5 150 105)"
													strokeWidth={2}
												/>
											}
										></TooltipIcon>
									) : (
										<TooltipIcon
											title={
												<Flex vertical gap="2px">
													<Text className="text-[12px] text-[#F97316] font-medium">
														Biến thể của bạn có thể tạo được nhưng nó thiếu một
														số trường quan trọng:
													</Text>
													<Flex vertical gap="4px" className="text-xs pl-2">
														<Text className="text-[#F97316] text-xs font-medium">
															{'- Hàng tồn kho'}
														</Text>
														<Text className="text-[#F97316] text-xs font-medium">
															{'- Tùy chọn'}
														</Text>
													</Flex>
												</Flex>
											}
											icon={
												<CircleAlert
													size={18}
													color="#E7B008"
													strokeWidth={2}
												/>
											}
										></TooltipIcon>
									)}
								</Col> */}
								<Col flex="40px">
									{fields.length > 0 ? (
										<div className="h-full">
											<Button
												type="text"
												danger
												icon={<Trash2 size={18} strokeWidth={2} />}
												onClick={() => remove(field.name)}
												// className="h-[46px]"
											/>
										</div>
									) : null}
								</Col>

								{state && (
									<AddVariantModal
										key={field.key}
										state={state}
										handleOk={() => onClose()}
										handleCancel={() => {
											onClose();
											remove(field.name);
										}}
										field={field}
										form={form}
									/>
								)}
							</Row>
						);
					})}
					<div className="w-full">
						<Form.Item>
							<Button
								type="default"
								className="w-full flex justify-center items-center"
								icon={<Plus size={20} className="stroke-2" />}
								onClick={() => onOpenModal(add)}
								disabled={disabledBtnAddVariant}
							>
								Thêm một phiên bản
							</Button>
						</Form.Item>
					</div>
				</Flex>
			)}
		</Form.List>
	);
};
