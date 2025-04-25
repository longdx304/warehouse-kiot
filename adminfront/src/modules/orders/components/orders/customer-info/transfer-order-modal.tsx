import { Flex } from '@/components/Flex';
import { SubmitModal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Tag } from '@/components/Tag';
import { Text, Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { Order } from '@medusajs/medusa';
import { Divider, Form, message, Space } from 'antd';
import {
	useAdminCustomer,
	useAdminCustomers,
	useAdminUpdateOrder,
} from 'medusa-react';
import moment from 'moment';
import { FC, useMemo, useState } from 'react';
import {
	FulfillmentStatus,
	PaymentStatus,
} from '../timeline/timeline-events/order-status';

type TransferOrdersModalProps = {
	order: Order;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const DEFAULT_PAGE_SIZE = 10;

const TransferOrdersModal: FC<TransferOrdersModalProps> = ({
	order,
	state,
	handleOk,
	handleCancel,
}) => {
	const [form] = Form.useForm();
	const [customersQuery, setCustomersQuery] = useState<string>('');

	const { customers } = useAdminCustomers({
		q: customersQuery,
		has_account: true,
		limit: DEFAULT_PAGE_SIZE,
		offset: 0,
	});
	const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

	const updateOrder = useAdminUpdateOrder(order?.id!);

	const { customer, isLoading: isLoadingCustomer } = useAdminCustomer(
		selectedCustomer ?? ''
	);

	/**
	 * Handles the form submission and transfers the order to a new customer.
	 *
	 * @param {any} values - The form values submitted by the user.
	 * @return {Promise<void>} A promise that resolves when the order is successfully transferred or rejects with an error.
	 */
	const onFinish = async () => {
		if (isLoadingCustomer || !customer) {
			return;
		}

		if (customer.id === order.customer_id) {
			message.info('Khách hàng đã là chủ sở hữu đơn hàng');
			handleCancel();
			form.resetFields();
			return;
		}

		try {
			await updateOrder.mutateAsync(
				{
					customer_id: customer?.id,
					email: customer?.email,
				},
				{
					onSuccess: () => {
						message.success('Đơn hàng đã được đổi chủ sở hữu thành công');
						handleOk();
						form.resetFields();
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				}
			);
		} catch (error) {
			console.log('error:', error);
		}
	};

	const handleCancelModal = () => {
		form.resetFields();
		handleCancel();
	};

	const getCustomerOption = (customer: {
		id: string;
		email: string;
		first_name?: string;
		last_name?: string;
	}) => {
		if (!customer) {
			return undefined;
		}

		const customerLabel = (c: {
			email: string;
			first_name?: string;
			last_name?: string;
		}) => {
			if (c.first_name && c.last_name) {
				return `${c.first_name} ${c.last_name} - ${c.email}`;
			} else if (c.first_name) {
				return `${c.first_name} - ${c.email}`;
			} else if (c.last_name) {
				return `${c.last_name} - ${c.email}`;
			}
			return `${c.email}`;
		};

		return {
			value: customer.id,
			label: customerLabel(customer),
		};
	};

	const customerOptions = useMemo(() => {
		return customers?.map((c) => getCustomerOption(c)).filter(Boolean) || [];
	}, [customers]);

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			handleCancel={handleCancelModal}
			form={form}
			width={700}
			isLoading={updateOrder.isLoading}
		>
			<Title level={3} className="text-center">
				Chuyển đơn hàng
			</Title>
			<Divider className="my-2" />
			<Form form={form} onFinish={onFinish} className="pt-4">
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					<div>
						<Text strong>Đơn hàng</Text>
						<Flex
							className="bg-gray-100 p-2 rounded mt-1"
							justify="space-between"
						>
							<Tag color={'#4B5563'}>{`#${order.display_id}`}</Tag>
							<Text type="secondary">
								{moment(order.created_at).format('MMM D, H:mm A')}
							</Text>
							<PaymentStatus paymentStatus={order.payment_status} />
							<FulfillmentStatus fulfillmentStatus={order.fulfillment_status} />
							<Text>{`${
								order.total
							} ${order.currency_code.toUpperCase()}`}</Text>
						</Flex>
					</div>
					<div>
						<Text strong className="mb-1">
							Chủ sở hữu hiện tại
						</Text>
						<Select
							className="mt-1 w-full"
							disabled
							value={order.customer_id}
							options={
								[
									getCustomerOption({
										id: order.customer_id,
										email: order.email,
										first_name:
											order.customer.first_name ||
											order.billing_address?.first_name ||
											order.shipping_address?.first_name || 
											undefined,
										last_name:
											order.customer.last_name ||
											order.billing_address?.last_name ||
											order.shipping_address?.last_name || 
											undefined,
									}),
								] as any
							}
						/>
					</div>
					<Form.Item
						labelCol={{ span: 24 }}
						name="new_owner"
						label={<span className="text-black">Chủ sở hữu mới</span>}
						rules={[
							{ required: true, message: 'Vui lòng chọn chủ sở hữu mới' },
						]}
					>
						<Select
							options={customerOptions as any}
							onSearch={setCustomersQuery}
							filterOption={false}
							showSearch
							onChange={setSelectedCustomer}
							placeholder="Vui lòng chọn chủ sở hữu mới"
						/>
					</Form.Item>
				</Space>
			</Form>
		</SubmitModal>
	);
};

export default TransferOrdersModal;
