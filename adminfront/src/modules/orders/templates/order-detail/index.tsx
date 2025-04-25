'use client';
import { Col, Row } from 'antd';
import { useAdminOrder } from 'medusa-react';

import BackToOrders from '@/modules/orders/components/orders/back-to-orders';
import CustomerInfo from '@/modules/orders/components/orders/customer-info';
import OrderEditModalContainer from '@/modules/orders/components/orders/edit-order-modal';
import Fulfillment from '@/modules/orders/components/orders/fulfillment';
import Information from '@/modules/orders/components/orders/information';
import Payment from '@/modules/orders/components/orders/payment';
import Summary from '@/modules/orders/components/orders/summary';
import Timeline from '@/modules/orders/components/orders/timeline';
import { useBuildTimeline } from '../../hooks/use-build-timeline';

interface Props {
	id: string;
}

export default function OrderDetail({ id }: Readonly<Props>) {
	// const { order, isLoading, refetch } = useAdminOrder(id);
	const { order, isLoading, refetch } = useAdminOrder(id, {
		expand:
			'handler,fulfillments.checker,fulfillments.shipper,customer,billing_address,shipping_address,discounts,discounts.rule,shipping_methods,shipping_methods.shipping_option,payments,items,fulfillments,fulfillments.tracking_links,returns,returns.shipping_method,returns.shipping_method.shipping_option,returns.shipping_method.tax_lines,refunds,claims.claim_items.item,claims.fulfillments,claims.return_order,claims.additional_items.variant.product.profiles,swaps.return_order,swaps.additional_items.variant.product.profiles,swaps.fulfillments,returnable_items,region,edits',
	});
	const {
		events,
		refetch: refetchTimeline,
		isLoading: isLoadingTimeline,
	} = useBuildTimeline(id);

	const refetchOrder = () => {
		refetch();
		refetchTimeline();
	};
	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToOrders />
			</Col>
			{order?.id && (
				<Col xs={24} lg={14} className="flex flex-col gap-y-4">
					<Information order={order} isLoading={isLoading} />
					<Summary
						order={order}
						isLoading={isLoading}
						reservations={[]}
						refetch={refetchOrder}
					/>
					<Payment order={order} isLoading={isLoading} refetch={refetchOrder} />
					<Fulfillment order={order} isLoading={isLoading} refetch={refetch} />
					<CustomerInfo order={order} isLoading={isLoading} />
				</Col>
			)}
			<Col xs={24} lg={10}>
				{order?.id && (
					<Timeline
						orderId={order.id}
						isLoading={isLoading || isLoadingTimeline}
						events={events}
						refetchOrder={refetch}
						refetch={refetchTimeline}
					/>
				)}
			</Col>
			{order && <OrderEditModalContainer order={order} />}
		</Row>
	);
}
