import { Col, Form, Row } from 'antd';
import { CircleAlert, Copy } from 'lucide-react';
import { FC } from 'react';

import { Input, InputNumber } from '@/components/Input';
import { Select } from '@/components/Select';
import { TooltipIcon } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { Product } from '@medusajs/medusa';
import { Flex } from '@/components/Flex';

type Props = {
	form: any;
	options: Product['options'];
};

const VariantGeneral: FC<Props> = ({ form, options }) => {
	const _options = Form.useWatch('options', form) || undefined;

	const handleCopyTitle = (indexOption: any) => {
		const value = _options[indexOption].value[0] ?? undefined;
		if (!value) return;
		form.setFieldValue('title', value);
	};

	return (
		<Row gutter={[16, 0]} className="w-full text-gray-500">
			<Col span={24}>
				<span>{'Cấu hình thông tin chung cho biến thể này.'}</span>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="title"
					label="Tên phiên bản"
					className="mb-2"
				>
					<Input placeholder="Màu trắng / XL..." />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="supplier_price"
					label="Giá nhập hàng"
					className="mb-2"
				>
					<InputNumber className="w-full" placeholder="0" min={0} allowClear />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="cogs_price"
					label="Giá vốn"
					className="mb-2"
				>
					<InputNumber className="w-full" placeholder="0" min={0} allowClear />
				</Form.Item>
			</Col>

			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="allowed_quantities"
					label="Số lượng cho phép"
					className="mb-2"
				>
					<InputNumber className="w-full" placeholder="0" min={0} allowClear />
				</Form.Item>
			</Col>

			<Col span={24}>
				<TooltipIcon
					title="Các tùy chọn được sử dụng để xác định màu sắc, kích thước, vv của biến thể."
					icon={<CircleAlert size={18} color="#E7B008" strokeWidth={2} />}
				>
					<Text className="text-sm text-gray-800 font-medium">{'Options'}</Text>
				</TooltipIcon>
			</Col>
			{options.map((option: any, index: number) => {
				const optionsSelect = option.values
					.map((value: any) => value.value)
					.filter((v: any, index: any, self: any) => self.indexOf(v) === index)
					.map((value: any) => ({
						value,
						label: value,
					}));
				return (
					<Col xs={24} key={index} className="flex">
						<Flex align="flex-start" className="w-full">
							<Form.Item
								labelCol={{ span: 24 }}
								name={['options', index, 'option_id']}
								hidden
								initialValue={option.id}
							>
								<Input />
							</Form.Item>
							<Form.Item
								labelCol={{ span: 24 }}
								name={['options', index, 'value']}
								rules={[
									{
										required: true,
										message: `Giá trị ${option.title.toLowerCase()} phải tồn tại!`,
									},
								]}
								label={option.title}
								className="mb-0 w-full"
							>
								{/* <Input placeholder={`${option.title}...`} /> */}
								<Select
									mode="tags"
									placeholder={`Chọn hoặc thêm một ${option.title.toLowerCase()}`}
									options={optionsSelect}
									maxCount={1}
								/>
							</Form.Item>
						</Flex>
						<Flex>
							<Copy
								size={18}
								className="mt-2 ml-2 h-[18px] w-[18px] cursor-pointer"
								onClick={() => handleCopyTitle(index)}
							/>
						</Flex>
					</Col>
				);
			})}
		</Row>
	);
};

export default VariantGeneral;
