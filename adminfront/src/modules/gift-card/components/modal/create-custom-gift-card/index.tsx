import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input, InputNumber, TextArea } from '@/components/Input';
import DatePicker from '@/components/Input/DatePicker';
import { Select } from '@/components/Select';
import { Switch } from '@/components/Switch';
import { Text } from '@/components/Typography';
import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { getErrorMessage } from '@/lib/utils';
import { RegionOption } from '@/types/gift-cards';
import { GiftCard } from '@medusajs/medusa';
import { Col, Form, message, Row } from 'antd';
import dayjs from 'dayjs';
import {
	useAdminCreateGiftCard,
	useAdminRegions,
	useMedusa,
} from 'medusa-react';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';

type CustomGiftcardProps = {
	onClose: () => void;
	open: boolean;
	giftCard?: GiftCard | null;
};

type CustomGiftCardFormType = {
	region_id: string;
	amount: number;
	ends_at: Date | null;
	email: string;
	message?: string;
};

const CustomGiftcard: FC<CustomGiftcardProps> = ({
	onClose,
	open,
	giftCard,
}) => {
	const [form] = Form.useForm();
	const { client } = useMedusa();
	const layeredModalContext = useContext(LayeredModalContext);
	const { mutate, isLoading } = useAdminCreateGiftCard();

	const [isEndDate, setIsEndDate] = useState<boolean>(false);

	useEffect(() => {
		if (open) {
			form.resetFields();
		}
	}, [open, form]);
	const { regions } = useAdminRegions({
		limit: 100,
	});

	useEffect(() => {
		if (!isEmpty(giftCard)) {
			if (giftCard.ends_at) setIsEndDate(true);
			form.setFieldsValue({
				region_id: giftCard.region_id,
				amount: giftCard.balance ? giftCard.balance : giftCard.value,
				ends_at: giftCard.ends_at ? dayjs(giftCard.ends_at) : null,
				email: giftCard.metadata?.email,
				message: giftCard.metadata?.message,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [giftCard]);

	const onFinish = async (data: CustomGiftCardFormType) => {
		// Create new gift card
		if (isEmpty(giftCard)) {
			mutate(
				{
					region_id: data.region_id,
					value: data.amount,
					ends_at: data.ends_at || undefined,
					metadata: {
						email: data.email,
						message: data.message,
					},
				},
				{
					onSuccess: () => {
						message.success('Tạo thẻ quà tặng thành công');
						onClose();
					},
					onError: (err: any) => {
						message.error(getErrorMessage(err));
					},
				}
			);
			return null;
		} else {
			// Update gift card
			await client.admin.giftCards
				.update(giftCard.id, {
					region_id: data.region_id,
					balance: data.amount,
					ends_at: data.ends_at || undefined,
					metadata: {
						email: data.email,
						message: data.message,
					},
				})
				.then(() => {
					message.success('Cập nhật thẻ quà tặng thành công');
					onClose();
				})
				.catch((err: any) => {
					message.error(getErrorMessage(err));
				});
		}
	};

	const regionOptions: RegionOption[] = useMemo(() => {
		return (
			regions?.map((r) => ({
				label: r.name,
				value: r.id,
			})) || []
		);
	}, [regions]);

	const currencySubscriber = Form.useWatch('region_id', form) as string;
	const currencySymbol = regions?.find((r) => r.id === currencySubscriber);

	// Modal: Render footer buttons
	const footer = (
		<div className="flex items-center justify-end gap-2">
			<Button
				onClick={onClose}
				loading={isLoading}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Hủy
			</Button>
			<Button
				className="text-sm min-w-32 justify-center"
				loading={isLoading}
				onClick={() => {
					form.submit();
				}}
			>
				{isEmpty(giftCard) ? 'Tạo và gửi' : 'Lưu và đóng'}
			</Button>
		</div>
	);

	return (
		<LayeredModal
			loading={isLoading}
			context={layeredModalContext}
			onCancel={onClose}
			open={open}
			footer={footer}
			title="Tạo thẻ quà tặng"
			className="layered-modal"
			width={800}
		>
			<Form form={form} onFinish={onFinish}>
				<Row gutter={[16, 8]}>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="region_id"
							label="Khu vực"
							className="mb-2"
							rules={[{ required: true, message: 'Khu vực phải có giá trị' }]}
						>
							<Select
								options={regionOptions}
								placeholder="Chọn khu vực của bạn.."
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="amount"
							label="Giá tiền"
							className="mb-2"
							rules={[{ required: true, message: 'Giá tiền phải có giá trị' }]}
						>
							<InputNumber
								min={0}
								max={giftCard?.value || undefined}
								placeholder="0"
								prefix={currencySymbol?.currency.symbol}
							/>
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Flex justify="space-between" align="flex-start">
							<Flex vertical>
								<Text strong className="text-sm">
									Thẻ quà tặng có ngày hết hạn?
								</Text>
								<Text className="text-[13px] text-gray-600">
									Lên lịch thẻ quà tặng để ngừng hoạt động trong tương lai.
								</Text>
							</Flex>
							<Switch
								value={isEndDate}
								onChange={(checked: boolean) => setIsEndDate(checked)}
								className=""
							/>
						</Flex>
						{isEndDate && (
							<Form.Item
								labelCol={{ span: 24 }}
								name="ends_at"
								label="Ngày hết hạn"
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
									placeholder="Chọn ngày bắt đầu"
									className="w-full"
								/>
							</Form.Item>
						)}
					</Col>
					<Col xs={24}>
						<Text strong className="text-sm">
							Người nhận
						</Text>
					</Col>
					<Col xs={24}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="email"
							label="Email"
							className="mb-2"
							rules={[
								{ required: true, message: 'Email phải có giá trị' },
								{ type: 'email', message: 'Email không hợp lệ' },
							]}
						>
							<Input placeholder="Email người nhận..." />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="message"
							label="Tin nhắn cá nhân"
							className="mb-2"
						>
							<TextArea placeholder="Nhập tin nhắn cho người nhận ở đây..." />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</LayeredModal>
	);
};

export default CustomGiftcard;
