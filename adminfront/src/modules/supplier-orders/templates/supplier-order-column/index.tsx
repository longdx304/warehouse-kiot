import { Supplier, SupplierOrders } from '@/types/supplier';
import { Tag } from 'antd';
import dayjs from 'dayjs';

type Props = {
	supplier: Supplier[] | null;
};

const decidePaymentStt = (status: any, className?: string) => {
	switch (status) {
		case 'pending':
			return (
				<Tag color="warning" className={className}>
					Chờ thanh toán
				</Tag>
			);
		case 'completed':
			return (
				<Tag color="success" className={className}>
					Đã thanh toán
				</Tag>
			);
		case 'canceled':
			return (
				<Tag color="error" className={className}>
					Đã huỷ
				</Tag>
			);
		default:
			return (
				<Tag color="processing" className={className}>
					Xem xét
				</Tag>
			);
	}
};

const decideFulfillmentStatus = (status: any, className?: string) => {
	switch (status) {
		case 'not_fulfilled':
			return (
				<Tag color="warning" className={className}>
					Chưa hoàn thành
				</Tag>
			);
		case 'delivered':
			return (
				<Tag color="cyan" className={className}>
					Hàng đã về kho
				</Tag>
			);
		case 'partially_inventoried':
			return (
				<Tag color="blue" className={className}>
					Nhập kho một phần
				</Tag>
			);
		case 'inventoried':
			return (
				<Tag color="success" className={className}>
					Đã nhập kho
				</Tag>
			);
		case 'rejected':
			return (
				<Tag color="error" className={className}>
					Đã hủy
				</Tag>
			);
		default:
			return (
				<Tag color="default" className={className}>
					N/A
				</Tag>
			);
	}
};

const orderType = {
	pending: 'Chờ thanh toán',
	completed: 'Đã thanh toán',
	canceled: 'Đã huỷ',
	default: 'Xem xét',
};
const supplierOrdersColumn = ({ supplier }: Props) => [
	{
		title: 'STT',
		dataIndex: 'display_id',
		key: 'display_id',
		width: 60,
		fixed: 'left',
		className: 'text-xs',
		render: (_: SupplierOrders['display_id']) => {
			return <Tag bordered={false}>#{_}</Tag>;
		},
	},
	{
		title: 'Nhà cung cấp',
		dataIndex: 'supplier_id',
		key: 'supplier_id',
		width: 150,
		className: 'text-xs text-wrap',
		render: (_: SupplierOrders['id'], record: SupplierOrders) => {
			const supplierName = supplier?.find(
				(item) => item.id === _
			)?.supplier_name;

			return supplierName || '-';
		},
	},
	{
		title: 'Nhập hàng',
		dataIndex: 'fulfillment_status',
		key: 'fulfillment_status',
		className: 'text-xs text-wrap',
		filters: [
			{ text: 'Chưa hoàn thành', value: 'not_fulfilled' },
			{ text: 'Hàng đã về kho', value: 'delivered' },
			{ text: 'Nhập kho một phần', value: 'partially_inventoried' },
			{ text: 'Đã nhập kho', value: 'inventoried' },
			{ text: 'Đã hủy', value: 'rejected' },
		],
		render: (_: SupplierOrders['fulfillment_status']) => {
			return decideFulfillmentStatus(_, 'text-wrap');
		},
	},
	{
		title: 'Trạng thái đơn hàng',
		dataIndex: 'status',
		key: 'status',
		className: 'text-xs text-wrap',
		filters: [
			{ text: orderType.pending, value: 'pending' },
			{ text: orderType.completed, value: 'completed' },
			{ text: orderType.canceled, value: 'canceled' },
			{ text: orderType.default, value: 'default' },
		],
		render: (_: SupplierOrders['status']) => {
			return decidePaymentStt(_, 'text-wrap');
		},
	},
	{
		title: 'Ngày đặt hàng',
		dataIndex: 'created_at',
		key: 'created_at',
		className: 'text-xs text-wrap',
		sorter: (a: any, b: any) =>
			dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
		render: (_: SupplierOrders['created_at']) => {
			return dayjs(_).format('DD/MM/YYYY');
		},
	},
	{
		title: 'Ngày thanh toán',
		dataIndex: 'settlement_time',
		key: 'settlement_time',
		className: 'text-xs text-wrap',
		sorter: (a: any, b: any) =>
			dayjs(a.settlement_time).valueOf() - dayjs(b.settlement_time).valueOf(),
		render: (_: SupplierOrders['settlement_time']) => {
			return dayjs(_).format('DD/MM/YYYY');
		},
	},
	{
		title: 'Ngày hoàn thành',
		dataIndex: 'estimated_production_time',
		key: 'estimated_production_time',
		className: 'text-xs text-wrap',
		sorter: (a: any, b: any) =>
			dayjs(a.estimated_production_time).valueOf() -
			dayjs(b.estimated_production_time).valueOf(),
		render: (_: SupplierOrders['estimated_production_time']) => {
			return dayjs(_).format('DD/MM/YYYY');
		},
	},
];

export default supplierOrdersColumn;
