import { SubmitModal } from '@/components/Modal';
import { Discount } from '@medusajs/medusa';
import { Col, Form, Input, message, Row } from 'antd';
import { useDiscountForm } from '../../discount-form/discount-form-context';
import { useEffect, useState } from 'react';
import { AllocationType, DiscountRuleType } from '@/types/discount';
import { useAdminUpdateDiscount } from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';
import Settings from '../../discount-form/section/configration';
import DatePicker from '@/components/Input/DatePicker';
import dayjs from 'dayjs';
import { Flex } from '@/components/Flex';
import { Text } from '@/components/Typography';
import { Switch } from '@/components/Switch';
import { InputNumber } from '@/components/Input';

type EditConfigurationsProps = {
	discount: Discount;
	open: boolean;
	onClose: () => void;
};

type ConfigurationsForm = {
	starts_at?: Date;
	ends_at?: Date | null;
	usage_limit: number | null;
	is_dynamic?: boolean;
	valid_duration: string | null;
};

const EditConfigurations = ({
	discount,
	open,
	onClose,
}: EditConfigurationsProps) => {
	const [form] = Form.useForm();
	const { mutate, isLoading } = useAdminUpdateDiscount(discount.id);

	const [isStartDate, setIsStartDate] = useState<boolean>(false);
	const [isEndDate, setIsEndDate] = useState<boolean>(false);
	const [isUseageLimit, setIsUseageLimit] = useState<boolean>(false);
	const [isDynamic, setIsDynamic] = useState<boolean>(false);

	const onFinish = async (values: ConfigurationsForm) => {
		mutate(
			{
				starts_at: values.starts_at ?? new Date(),
				ends_at: values.ends_at,
				usage_limit:
					values.usage_limit && values.usage_limit > 0
						? values.usage_limit
						: null,
				// valid_duration: values.valid_duration,
			},
			{
				onSuccess: () => {
					message.success('Cập nhật cấu hình thành công.');
					onClose();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	useEffect(() => {
		form.setFieldsValue({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
		if (discount.starts_at) {
			setIsStartDate(true);
			form.setFieldsValue({
				starts_at: dayjs(discount.starts_at),
			});
		}
		if (discount.ends_at) {
			setIsEndDate(true);
			form.setFieldsValue({
				ends_at: dayjs(discount.ends_at),
			});
		}
		if (discount.usage_limit) {
			setIsUseageLimit(true);
			form.setFieldsValue({
				usage_limit: discount.usage_limit,
			});
		}
		if (discount.is_dynamic) {
			setIsDynamic(true);
			form.setFieldsValue({
				is_dynamic: discount.is_dynamic,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discount]);

	const handleChangeEndDate = (checked: boolean) => {
		setIsEndDate(checked);
		if (checked && !discount.ends_at) {
			form.setFieldsValue({
				ends_at: dayjs().add(7, 'day'),
			});
		}
	};
	return (
		<SubmitModal
			title="Chỉnh sửa cấu hình"
			open={open}
			handleCancel={onClose}
			form={form}
			isLoading={isLoading}
		>
			<Form
				form={form}
				onFinish={onFinish}
				className="flex flex-col gap-4 mt-4"
			>
				<div>
					<Flex justify="space-between" align="flex-start">
						<Flex vertical>
							<Text strong className="text-sm">
								Ngày bắt đầu
							</Text>
							<Text className="text-[13px] text-gray-600">
								Lên lịch giảm giá để kích hoạt trong tương lai.
							</Text>
						</Flex>
						<Switch
							value={isStartDate}
							onChange={(checked: boolean) => setIsStartDate(checked)}
							className=""
						/>
					</Flex>
					{isStartDate && (
						<Form.Item
							labelCol={{ span: 24 }}
							name="starts_at"
							label="Ngày bắt đầu"
							className="mb-0 mt-4"
							rules={[
								{ required: true, message: 'Vui lòng chọn ngày bắt đầu' },
							]}
							// initialValue={moment().format('DD/MM/YYYY')}
						>
							<DatePicker
								showTime
								format="DD-MM-YYYY HH:mm"
								minDate={dayjs()}
								placeholder="Chọn ngày bắt đầu"
								className="w-full"
							/>
						</Form.Item>
					)}
				</div>
				<div>
					<Flex justify="space-between" align="flex-start">
						<Flex vertical>
							<Text strong className="text-sm">
								Giảm giá có ngày hết hạn?
							</Text>
							<Text className="text-[13px] text-gray-600">
								Lên lịch giảm giá để ngừng hoạt động trong tương lai.
							</Text>
						</Flex>
						<Switch
							value={isEndDate}
							onChange={handleChangeEndDate}
							className=""
						/>
					</Flex>
					{isEndDate && (
						<Form.Item
							labelCol={{ span: 24 }}
							name="ends_at"
							label="Giảm giá có ngày hết hạn?"
							className="mb-0 mt-4"
							rules={[
								{ required: true, message: 'Vui lòng chọn ngày hết hạn' },
							]}
							// initialValue={moment().format('DD/MM/YYYY')}
						>
							<DatePicker
								showTime
								format="DD-MM-YYYY HH:mm"
								minDate={dayjs()}
								placeholder="Chọn ngày hết hạn"
								className="w-full"
							/>
						</Form.Item>
					)}
				</div>
				<div>
					<Flex justify="space-between" align="flex-start">
						<Flex vertical>
							<Text strong className="text-sm">
								Giới hạn số lần đổi?
							</Text>
							<Text className="text-[13px] text-gray-600">
								Giới hạn áp dụng cho tất cả khách hàng, không phải mỗi khách
								hàng.
							</Text>
						</Flex>
						<Switch
							value={isUseageLimit}
							onChange={(checked: boolean) => setIsUseageLimit(checked)}
							className=""
						/>
					</Flex>
					{isUseageLimit && (
						<Form.Item
							labelCol={{ span: 24 }}
							name="usage_limit"
							label="Số lần đổi"
							className="mb-0 mt-4"
							rules={[{ required: true, message: 'Vui lòng nhập số lần đổi' }]}
							// initialValue={moment().format('DD/MM/YYYY')}
						>
							<InputNumber className="w-full" placeholder="5" />
						</Form.Item>
					)}
				</div>
				{discount.is_dynamic && (
					<div>
						<Flex justify="space-between" align="flex-start">
							<Flex vertical>
								<Text strong className="text-sm">
									Thời gian sẵn có?
								</Text>
								<Text className="text-[13px] text-gray-600">
									Đặt thời gian giảm giá.
								</Text>
							</Flex>
							<Switch
								value={isDynamic}
								onChange={(checked: boolean) => setIsDynamic(checked)}
								className=""
							/>
						</Flex>
						{isDynamic && (
							<Form.Item
								labelCol={{ span: 24 }}
								name="valid_duration"
								label="Số lần đổi"
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
						)}
					</div>
				)}
			</Form>
		</SubmitModal>
	);
};

export default EditConfigurations;
