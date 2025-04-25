import { Order } from '@medusajs/medusa';
import { Card } from '@/components/Card';
import { Title } from '@/components/Typography';
import { Check, CornerDownLeft, CornerDownRight } from 'lucide-react';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { Empty, Modal as AntdModal, message, Divider, MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useAdminCapturePayment, useCartOrder, useGetCart } from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';
import { DisplayTotal } from '@/modules/orders/components/common';
import { formatAmountWithSymbol } from '@/utils/prices';
import useToggleState from '@/lib/hooks/use-toggle-state';
import RefundModal from './refund-modal';
import { ActionAbles } from '@/components/Dropdown';
import CaptureModal from './capture-modal';

type Props = {
	order: Order | undefined;
	isLoading: boolean;
	refetch: () => void;
};

const Payment = ({ order, isLoading, refetch }: Props) => {
	const capturePayment = useAdminCapturePayment(order?.id! || '');
	const { state, onOpen, onClose } = useToggleState(false);
	const {
		state: stateCapture,
		onOpen: openCapture,
		onClose: closeCapture,
	} = useToggleState(false);

	if (!order) {
		return (
			<Card loading={isLoading}>
				<Empty description="Chưa có đơn hàng" />
			</Card>
		);
	}

	const actions: MenuProps['items'] = [];

	const confirmCapture = () => {
		AntdModal.confirm({
			title: 'Xác nhận hoàn tất thanh toán',
			content: 'Bạn có chắc chắn đã hoàn tất thanh toán?',
			onOk: async () => {
				await capturePayment.mutateAsync(void {}, {
					onSuccess: () => {
						message.success('Đã hoàn tất thanh toán');
						return null;
					},
					onError: (err) => {
						message.error(getErrorMessage(err));
						return null;
					},
				});
			},
		});
	};
	const { payment_status } = order;
	switch (true) {
		case payment_status === 'awaiting': {
			actions.push({
				label: 'Thu tiền',
				key: 'capture',
				icon: <CornerDownRight size={16} />,
				onClick: openCapture,
			});
			break;
		}
		case payment_status === 'captured': {
			actions.push({
				label: 'Hoàn tiền',
				key: 'refund',
				icon: <CornerDownLeft size={16} />,
				onClick: onOpen,
			});
			break;
		}
		case payment_status === 'partially_refunded': {
			actions.push(
				{
					label: 'Hoàn tất thanh toán',
					key: 'capture-payment',
					icon: <Check size={16} />,
					onClick: confirmCapture,
				},
				{
					label: 'Hoàn tiền',
					key: 'refund',
					icon: <CornerDownLeft size={16} />,
					onClick: onOpen,
				}
			);
			break;
		}
		case payment_status === 'requires_action': {
			return null;
		}
		default:
			break;
	}

	const handleOkRefund = () => {
		onClose();
	};

	return (
		<Card loading={isLoading} className="px-4">
			<div>
				<div className="pb-2 flex flex-col lg:flex-row lg:justify-between">
					<Title level={4}>{`Thanh toán`}</Title>
					<div className="flex justify-end items-center gap-2 flex-wrap">
						<PaymentStatus status={order?.payment_status} />
						<ActionAbles actions={actions} />
					</div>
				</div>
			</div>
			<div className="pt-6">
				{order?.payments?.map((payment) => (
					<div key={payment.id} className="flex flex-col">
						<DisplayTotal
							currency={order.currency_code}
							totalAmount={Math.round(payment.amount)}
							totalTitle={payment.id}
							subtitle={`${dayjs(payment.created_at).format(
								'hh:mm DD MMM YYYY'
							)}`}
						/>
						{!!payment.amount_refunded && (
							<div className="mt-4 flex justify-between items-center text-xs">
								<div className="flex items-center">
									<div className="text-gray-400 mr-2">
										<CornerDownRight size={20} />
									</div>
									<div className="font-normal text-gray-900">
										{'Đã hoàn tiền'}
									</div>
								</div>
								<div className="flex items-center">
									<div className="font-normal text-gray-900 mr-3">
										-
										{formatAmountWithSymbol({
											amount: Math.round(payment.amount_refunded) as number,
											currency: order.currency_code,
										})}
									</div>
									<div className="font-normal text-gray-500">
										{order.currency_code.toUpperCase()}
									</div>
								</div>
							</div>
						)}
						<Divider className="my-2" />
						{payment_status === 'awaiting' && (
							<div className="flex flex-col gap-1">
								<div className="flex justify-between text-xs">
									<div className="font-semibold text-grey-90">
										{'Số tiền đã thanh toán'}
									</div>
									<div className="flex">
										<div className="font-semibold text-gray-900 mr-3">
											{formatAmountWithSymbol({
												amount: payment?.data?.paid_total
													? Math.round(payment!.data!.paid_total as number)
													: 0,
												currency: order.currency_code,
											})}
										</div>
										<div className="font-regular text-gray-500">
											{order.currency_code.toUpperCase()}
										</div>
									</div>
								</div>
								<div className="flex justify-between text-xs">
									<div className="font-semibold text-grey-90">
										{'Số tiền cần thanh toán'}
									</div>
									<div className="flex">
										<div className="font-semibold text-gray-900 mr-3">
											{formatAmountWithSymbol({
												amount:
													Math.round(payment?.amount) -
													(payment?.data?.paid_total
														? Math.round(payment!.data!.paid_total as number)
														: 0),
												currency: order.currency_code,
											})}
										</div>
										<div className="font-regular text-gray-500">
											{order.currency_code.toUpperCase()}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				))}
				{payment_status !== 'awaiting' && (
					<div className="flex justify-between text-xs">
						<div className="font-semibold text-grey-90">
							{'Số tiền đã thanh toán'}
						</div>
						<div className="flex">
							<div className="font-semibold text-gray-900 mr-3">
								{formatAmountWithSymbol({
									amount:
										Math.round(order.paid_total) -
										Math.round(order.refunded_total),
									currency: order.currency_code,
								})}
							</div>
							<div className="font-regular text-gray-500">
								{order.currency_code.toUpperCase()}
							</div>
						</div>
					</div>
				)}
			</div>
			{state && (
				<RefundModal
					state={state}
					handleOk={handleOkRefund}
					handleCancel={onClose}
					order={order}
					refetch={refetch}
				/>
			)}
			{stateCapture && (
				<CaptureModal
					state={stateCapture}
					handleOk={closeCapture}
					handleCancel={closeCapture}
					order={order}
					refetch={refetch}
				/>
			)}
		</Card>
	);
};

export default Payment;

const PaymentStatus = ({ status }: { status: Order['payment_status'] }) => {
	switch (status) {
		case 'captured':
			return (
				<StatusIndicator
					title="Đã thanh toán"
					variant="success"
					className="font-normal"
				/>
			);
		case 'partially_refunded':
			return (
				<StatusIndicator
					title="Một phần được hoàn lại"
					variant="success"
					className="font-normal"
				/>
			);
		case 'awaiting':
			return (
				<StatusIndicator
					title="Chờ thanh toán"
					variant="danger"
					className="font-normal"
				/>
			);
		case 'canceled':
			return (
				<StatusIndicator
					title="Đã huỷ"
					variant="danger"
					className="font-normal"
				/>
			);
		case 'requires_action':
			return (
				<StatusIndicator
					title="Yêu cầu thanh toán"
					variant="danger"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};
