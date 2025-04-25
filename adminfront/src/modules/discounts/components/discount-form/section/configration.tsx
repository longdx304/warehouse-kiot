import { Discount } from '@medusajs/medusa';
import { useDiscountForm } from '../discount-form-context';
import { useEffect, useMemo, useState } from 'react';
import { Col, Form, Input, Row } from 'antd';
import { Collapse } from '@/components/Collapse';
import { Switch } from '@/components/Switch';
import { TooltipIcon } from '@/components/Tooltip';
import { CircleAlert } from 'lucide-react';
import { Flex } from '@/components/Flex';
import DatePicker from '@/components/Input/DatePicker';
import dayjs from 'dayjs';
import { Text } from '@/components/Typography';
import { InputNumber } from '@/components/Input';

type SettingsProps = {
	isEdit?: boolean;
	promotion?: Discount;
};

const getActiveTabs = (promotion: Discount) => {
	const activeTabs: string[] = [];

	if (promotion.usage_limit !== null) {
		activeTabs.push('usage_limit');
	}

	if (promotion.starts_at !== null) {
		activeTabs.push('starts_at');
	}

	if (promotion.ends_at !== null) {
		activeTabs.push('ends_at');
	}

	if (promotion.valid_duration !== null) {
		activeTabs.push('valid_duration');
	}

	return activeTabs;
};

const ExpandIcon = ({ isActive }: { isActive: boolean }) => (
	<Switch checked={isActive} />
);

const Settings: React.FC<SettingsProps> = ({ isEdit, promotion }) => {
	const { isDynamic, handleConfigurationChanged, form } = useDiscountForm();

	useEffect(() => {
		if (promotion) {
			form.setFieldsValue({
				starts_at: promotion.starts_at ? dayjs(promotion.starts_at) : dayjs(),
				ends_at: promotion.ends_at ? dayjs(promotion.ends_at) : null,
				usage_limit: promotion.usage_limit,
				valid_duration: promotion.valid_duration,
			});
		}
	}, [promotion, form]);
	const itemsCollapse = useMemo(() => {
		const items = [
			{
				key: 'starts_at',
				label: (
					<div>
						<Flex gap="4px">
							<div>{'Ngày bắt đầu'}</div>
							<TooltipIcon
								title="Nếu bạn muốn lên lịch giảm giá để kích hoạt trong tương lai, bạn có thể đặt ngày bắt đầu ở đây, nếu không, giảm giá sẽ có hiệu lực ngay lập tức."
								icon={<CircleAlert size={16} />}
							/>
						</Flex>
						<Text className="text-xs text-gray-500">
							Lên lịch giảm giá để kích hoạt trong tương lai.
						</Text>
					</div>
				),
				children: (
					<Form.Item
						labelCol={{ span: 24 }}
						name="starts_at"
						className="mb-0 mt-4"
						rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
					>
						<DatePicker
							showTime
							format="DD-MM-YYYY HH:mm"
							// minDate={dayjs()}
							placeholder="Chọn ngày bắt đầu"
							className="w-full"
						/>
					</Form.Item>
				),
			},
			{
				key: 'ends_at',
				label: (
					<div>
						<Flex gap="4px">
							<div>{'Giảm giá có ngày hết hạn?'}</div>
							<TooltipIcon
								title="Nếu bạn muốn lên lịch giảm giá để ngừng hoạt động trong tương lai, bạn có thể đặt ngày hết hạn ở đây."
								icon={<CircleAlert size={16} />}
							/>
						</Flex>
						<Text className="text-xs text-gray-500">
							Lên lịch giảm giá để ngừng hoạt động trong tương lai.
						</Text>
					</div>
				),
				children: (
					<Form.Item
						labelCol={{ span: 24 }}
						name="ends_at"
						className="mb-0 mt-4"
						rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
					>
						<DatePicker
							showTime
							format="DD-MM-YYYY HH:mm"
							minDate={dayjs()}
							placeholder="Chọn ngày hết hạn"
							className="w-full"
						/>
					</Form.Item>
				),
			},
			{
				key: 'usage_limit',
				label: (
					<div>
						<Flex gap="4px">
							<div>{'Giới hạn số lần đổi?'}</div>
							<TooltipIcon
								title="Nếu bạn muốn giới hạn số lần khách hàng có thể đổi giảm giá này, bạn có thể đặt một giới hạn ở đây"
								icon={<CircleAlert size={16} />}
							/>
						</Flex>
						<Text className="text-xs text-gray-500">
							Giới hạn áp dụng cho tất cả khách hàng, không phải mỗi khách hàng.
						</Text>
					</div>
				),
				children: (
					<Form.Item
						labelCol={{ span: 24 }}
						name="usage_limit"
						label="Số lần đổi"
						className="mb-0 mt-4"
						rules={[{ required: true, message: 'Vui lòng nhập số lần đổi' }]}
					>
						<InputNumber className="w-full" placeholder="5" />
					</Form.Item>
				),
			},
		];
		if (isDynamic) {
			items.push({
				key: 'valid_duration',
				label: (
					<div>
						<Flex gap="4px">
							<div>{'Thời gian sẵn có?'}</div>
							<TooltipIcon
								title="Chọn loại giảm giá"
								icon={<CircleAlert size={16} />}
							/>
						</Flex>
						<Text className="text-xs text-gray-500">
							Đặt thời gian giảm giá.
						</Text>
					</div>
				),
				children: (
					<Form.Item
						labelCol={{ span: 24 }}
						name="valid_duration"
						className="mb-0 mt-4"
					>
						<Input.Group compact>
							<Row gutter={[16, 4]}>
								<Col xs={12} sm={8}>
									<Form.Item
										labelCol={{ span: 24 }}
										name={['valid_duration', 'years']}
										label="Năm"
										className="mb-0"
									>
										<InputNumber className="w-full" placeholder="0" />
									</Form.Item>
								</Col>
								<Col xs={12} sm={8}>
									<Form.Item
										labelCol={{ span: 24 }}
										name={['valid_duration', 'months']}
										label="Tháng"
										className="mb-0"
									>
										<InputNumber className="w-full" placeholder="0" />
									</Form.Item>
								</Col>
								<Col xs={12} sm={8}>
									<Form.Item
										labelCol={{ span: 24 }}
										name={['valid_duration', 'days']}
										label="Ngày"
										className="mb-0"
									>
										<InputNumber className="w-full" placeholder="0" />
									</Form.Item>
								</Col>
								<Col xs={12} sm={8}>
									<Form.Item
										labelCol={{ span: 24 }}
										name={['valid_duration', 'hours']}
										label="Giờ"
										className="mb-0"
									>
										<InputNumber className="w-full" placeholder="0" />
									</Form.Item>
								</Col>
								<Col xs={12} sm={8}>
									<Form.Item
										labelCol={{ span: 24 }}
										name={['valid_duration', 'minutes']}
										label="Phút"
										className="mb-0"
									>
										<InputNumber className="w-full" placeholder="0" />
									</Form.Item>
								</Col>
							</Row>
						</Input.Group>
					</Form.Item>
				),
			});
		}
		return items;
	}, [isDynamic]);

	const handleChange = (values: string | string[]) => {
		if (Array.isArray(values)) {
			handleConfigurationChanged(values);
		}
	};
	return (
		<Collapse
			className="bg-white [&_.ant-collapse-header]:px-0 [&_.ant-collapse-header]:text-base [&_.ant-collapse-header]:font-medium"
			// defaultActiveKey={activeTabs}
			items={itemsCollapse as any}
			expandIconPosition="end"
			bordered={false}
			expandIcon={ExpandIcon as any}
			onChange={handleChange}
		/>
	);
};

export default Settings;
