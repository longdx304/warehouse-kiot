import { Col, Form, Row } from 'antd';
import { CircleAlert, Copy, Tags } from 'lucide-react';
import { FC } from 'react';

import { Input, InputNumber } from '@/components/Input';
import { Select } from '@/components/Select';
import { TooltipIcon } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { useStoreData } from '@/modules/regions/components/region-modal/use-store-data';
import { Flex } from '@/components/Flex';

type Props = {
	form: any;
	field: any;
};

const VariantGeneral: FC<Props> = ({ form, field }) => {
	const options = Form.useWatch('options', form) || undefined;
	const variant = Form.useWatch(['variants', field.name], form) || undefined;
	const { currencyOptions } = useStoreData();

	const handleCopyTitle = (indexOption: any) => {
		const value = variant?.options[indexOption]?.value ?? undefined;
		if (!value) return;
		form.setFieldValue(['variants', field.name, 'title'], value);
	};
	return (
		<Row gutter={[16, 0]} className="w-full text-gray-500">
			<Col span={24}>
				<span>{'Cấu hình thông tin chung cho biến thể này.'}</span>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={[field.name, 'title']}
					rules={[
						{
							required: true,
							message: 'Tên sản phẩm phải có ít nhất 2 ký tự!',
						},
					]}
					label="Tên phiên bản"
					className="mb-2"
				>
					<Input placeholder="Màu trắng / XL..." />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={[field.name, 'prices', 0, 'currency_code']}
					label="Tiền tệ"
					className="mb-2"
				>
					<Select placeholder="Chọn tiền tệ" options={currencyOptions} />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={[field.name, 'prices', 0, 'amount']}
					label="Giá bán hàng"
					className="mb-2"
				>
					<InputNumber className="w-full" placeholder="0" min={0} allowClear />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={[field.name, 'supplier_price']}
					label="Giá nhập hàng"
					className="mb-2"
				>
					<InputNumber className="w-full" placeholder="0" min={0} allowClear />
				</Form.Item>
			</Col>

			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={[field.name, 'allowed_quantity']}
					label="Định lượng đôi"
					className="mb-2"
					initialValue={6}
				>
					<InputNumber className="w-full" placeholder="0" min={6} allowClear />
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
			{options
				?.filter((item: any) => item)
				.map((option: any, index: number) => {
					const optionsSelect = option.values.map((value: any) => ({
						value,
						label: value,
					}));
					return (
						<Col xs={24} className="flex" key={index}>
							<Flex align="flex-end" className="w-full">
								<Form.Item
									labelCol={{ span: 24 }}
									name={[field.name, 'options', index, 'value']}
									rules={[
										{
											required: true,
											message: `Giá trị ${option.title.toLowerCase()} phải tồn tại!`,
										},
									]}
									label={option.title}
									className="mb-0 w-full"
								>
									<Select
										placeholder={`Chọn một ${option.title.toLowerCase()}`}
										options={optionsSelect}
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
