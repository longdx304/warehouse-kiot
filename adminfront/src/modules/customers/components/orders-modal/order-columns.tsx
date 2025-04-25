import { Order } from '@medusajs/medusa';
import dayjs from 'dayjs';

const decideFulfillmentStatus = (status: string) => {
	switch (status) {
		case 'fulfilled':
			return 'Đã giao';
		case 'not_fulfilled':
			return 'Chưa giao';
		case 'exported':
			return 'Đã xuất kho';
		case 'partially_fulfilled':
			return 'Giao một phần';
		case 'partially_shipped':
			return 'Vận chuyển một phần';
		case 'requires':
			return 'Yêu cầu giao hàng';
		default:
			return 'N/A';
	}
};

const decidePaymentStatus = (status: string) => {
	switch (status) {
		case 'captured':
			return 'Đã thanh toán';
		case 'awaiting':
			return 'Chờ thanh toán';
		case 'requires':
			return 'Yêu cầu thanh toán';
		default:
			return 'N/A';
	}
};
type Props = {};

const ordersColumns = ({}: Props) => [
	{
		title: 'Đơn hàng',
		dataIndex: 'display_id',
		key: 'display_id',
		fixed: 'left',
		width: 150,
		className: 'text-xs',
	},
	{
		title: 'Ngày tạo',
		dataIndex: 'created_at',
		key: 'created_at',
		width: 150,
		className: 'text-xs',
		render: (_: Order['created_at']) => {
			return dayjs(_).format('DD/MM/YYYY HH:mm');
		},
	},
	{
		title: 'Giao hàng',
		dataIndex: 'fulfillment_status',
		key: 'fulfillment_status',
		width: 150,
		className: 'text-xs',
		render: (_: Order['fulfillment_status']) => {
			return decideFulfillmentStatus(_);
		},
	},
	{
		title: 'Trạng thái',
		dataIndex: 'payment_status',
		key: 'payment_status',
		width: 150,
		className: 'text-xs',
		render: (_: Order['payment_status']) => {
			return decidePaymentStatus(_);
		},
	},
	{
		title: 'Tổng cộng',
		dataIndex: 'total',
		key: 'total',
		width: 150,
		className: 'text-xs',
		render: (_: Order['total']) => {
			return `-`;
		},
	},
];

export default ordersColumns;
