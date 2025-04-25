import React from 'react';
import StatusIndicator from '@/modules/common/components/status-indicator';

type PaymentStatusProps = {
	paymentStatus: string;
};

type FulfillmentStatusProps = {
	fulfillmentStatus: string;
};

type OrderStatusProps = {
	orderStatus: string;
};

type ReturnStatusProps = {
	returnStatus: string;
};

type RefundStatusProps = {
	refundStatus: string;
};

const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentStatus }) => {
	switch (paymentStatus) {
		case 'difference_refunded':
			return (
				<StatusIndicator
					title="Thanh toán"
					variant="success"
					className="font-normal"
				/>
			);
		case 'captured':
			return (
				<StatusIndicator
					title="Thanh toán"
					variant="success"
					className="font-normal"
				/>
			);
		case 'awaiting':
			return (
				<StatusIndicator
					title="Chờ thanh toán"
					variant="default"
					className="font-normal"
				/>
			);
		case 'not_paid':
			return (
				<StatusIndicator
					title="Chưa thanh toán"
					variant="default"
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
					title="Yêu cầu thực hiện"
					variant="danger"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};

const OrderStatus: React.FC<OrderStatusProps> = ({ orderStatus }) => {
	switch (orderStatus) {
		case 'completed':
			return (
				<StatusIndicator
					title="Hoàn thành"
					variant="success"
					className="font-normal"
				/>
			);
		case 'pending':
			return (
				<StatusIndicator
					title="Đang xử lý"
					variant="default"
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
					title="Đã loại"
					variant="danger"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};

const FulfillmentStatus: React.FC<FulfillmentStatusProps> = ({
	fulfillmentStatus,
}) => {
	switch (fulfillmentStatus) {
		case 'shipped':
			return (
				<StatusIndicator
					title="Đã gửi"
					variant="success"
					className="font-normal"
				/>
			);
		case 'fulfilled':
			return (
				<StatusIndicator
					title="Đã thực hiện"
					variant="warning"
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
		case 'partially_fulfilled':
			return (
				<StatusIndicator
					title="Thực hiện một phần"
					variant="warning"
					className="font-normal"
				/>
			);
		case 'not_fulfilled':
			return (
				<StatusIndicator
					title="Chờ thực hiện"
					variant="default"
					className="font-normal"
				/>
			);
		case 'requires_action':
			return (
				<StatusIndicator
					title="Yêu cầu thực hiện"
					variant="danger"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};

const ReturnStatus: React.FC<ReturnStatusProps> = ({ returnStatus }) => {
	switch (returnStatus) {
		case 'received':
			return (
				<StatusIndicator
					title="Đã nhận"
					variant="success"
					className="font-normal"
				/>
			);
		case 'requested':
			return (
				<StatusIndicator
					title="Đã yêu cầu"
					variant="default"
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
					title="Yêu cầu thực hiện"
					variant="danger"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};

const RefundStatus: React.FC<RefundStatusProps> = ({ refundStatus }) => {
	switch (refundStatus) {
		case 'na':
			return <StatusIndicator title="N/A" variant="default" />;
		case 'not_refunded':
			return <StatusIndicator title="Chưa được hoàn" variant="default" />;
		case 'refunded':
			return <StatusIndicator title="Đã hoàn" variant="success" />;
		case 'canceled':
			return <StatusIndicator title="Đã huỷ" variant="danger" />;
		default:
			return null;
	}
};

export {
	PaymentStatus,
	OrderStatus,
	FulfillmentStatus,
	ReturnStatus,
	RefundStatus,
};
