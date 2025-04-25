import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Title } from '@/components/Typography';
import { useAdminSupplierOrderCapturePayment } from '@/lib/hooks/api/supplier-order';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { DisplayTotal } from '@/modules/supplier-orders/common';
import { SupplierOrder } from '@/types/supplier';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Modal as AntdModal, Divider, Empty, MenuProps, message } from 'antd';
import dayjs from 'dayjs';
import { Check, CornerDownLeft, CornerDownRight } from 'lucide-react';
import CaptureModal from './capture-modal';
import RefundModal from './refund-modal';

type Props = {
	supplierOrder: SupplierOrder | undefined;
	isLoading: boolean;
	refetch: () => void;
};

const Payment = ({ supplierOrder, isLoading, refetch }: Props) => {
	const capturePayment = useAdminSupplierOrderCapturePayment(
		supplierOrder?.id! || ''
	);
	const { state, onOpen, onClose } = useToggleState(false);
	const {
		state: stateCapture,
		onOpen: openCapture,
		onClose: closeCapture,
	} = useToggleState(false);

	if (!supplierOrder) {
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
	const { payment_status } = supplierOrder;
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
		case payment_status === 'not_paid': {
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
						<PaymentStatus status={supplierOrder?.payment_status} />
						<ActionAbles actions={actions} />
					</div>
				</div>
			</div>
			<div className="pt-6">
				{supplierOrder?.payments?.map((payment) => (
					<div key={payment.id} className="flex flex-col">
						<DisplayTotal
							currency={supplierOrder.currency_code}
							totalAmount={payment.amount}
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
											amount: payment.amount_refunded as number,
											currency: supplierOrder.currency_code,
										})}
									</div>
									<div className="font-normal text-gray-500">
										{supplierOrder.currency_code.toUpperCase()}
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
												amount: (payment?.data?.paid_total as number) ?? 0,
												currency: supplierOrder.currency_code,
											})}
										</div>
										<div className="font-regular text-gray-500">
											{supplierOrder.currency_code.toUpperCase()}
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
													(payment?.amount as number) -
													((payment?.data?.paid_total as number) ?? 0),
												currency: supplierOrder.currency_code,
											})}
										</div>
										<div className="font-regular text-gray-500">
											{supplierOrder.currency_code.toUpperCase()}
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
										supplierOrder.paid_total - supplierOrder.refunded_total,
									currency: supplierOrder.currency_code,
								})}
							</div>
							<div className="font-regular text-gray-500">
								{supplierOrder.currency_code.toUpperCase()}
							</div>
						</div>
					</div>
				)}
			</div>
			{/* Refund modal */}
			{state && (
				<RefundModal
					state={state}
					handleOk={handleOkRefund}
					handleCancel={onClose}
					supplierOrder={supplierOrder}
					refetch={refetch}
				/>
			)}

			{/* Capture modal */}
			{stateCapture && (
				<CaptureModal
					state={stateCapture}
					handleOk={closeCapture}
					handleCancel={closeCapture}
					supplierOrder={supplierOrder}
					refetch={refetch}
				/>
			)}
		</Card>
	);
};

export default Payment;

const PaymentStatus = ({
	status,
}: {
	status: SupplierOrder['payment_status'];
}) => {
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
