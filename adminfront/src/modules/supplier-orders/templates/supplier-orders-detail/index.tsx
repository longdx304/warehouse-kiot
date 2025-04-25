'use client';
import { useAdminSupplierOrder } from '@/lib/hooks/api/supplier-order';
import BackToOrders from '@/modules/supplier-orders/components/supplier-order-detail/back-to-orders';
import Information from '@/modules/supplier-orders/components/supplier-order-detail/information';
import Summary from '@/modules/supplier-orders/components/supplier-order-detail/summary';
import { Col, Row } from 'antd';
import Documents from '../../components/supplier-order-detail/documents';
import SupplierOrderEditModalContainer from '../../components/supplier-order-detail/edit-supplier-order-modal';
import Payment from '../../components/supplier-order-detail/payment';
import Timeline from '../../components/supplier-order-detail/timeline';
import { useBuildTimeline } from '../../hooks/use-build-timeline';

interface Props {
	id: string;
}

export default function SupplierOrdersDetail({ id }: Readonly<Props>) {
	const { supplierOrder, isLoading, refetch } = useAdminSupplierOrder(id);
	const { events, refetch: refetchTimeline } = useBuildTimeline(id);

	const refetchOrder = () => {
		refetch();
		refetchTimeline();
	};

	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToOrders />
			</Col>
			<Col xs={24} lg={14} className="flex flex-col gap-y-4">
				<Information supplierOrder={supplierOrder!} isLoading={isLoading} />
				<Summary
					supplierOrder={supplierOrder}
					isLoading={isLoading}
					reservations={[]}
					refetch={refetchOrder}
				/>
				<Documents order={supplierOrder} isLoading={isLoading} />
				<Payment
					supplierOrder={supplierOrder}
					isLoading={isLoading}
					refetch={refetchOrder}
				/>
			</Col>
			<Col xs={24} lg={10}>
				<Timeline
					orderId={id}
					isLoading={isLoading}
					events={events}
					refetchOrder={refetch}
					refetch={refetchTimeline}
				/>
			</Col>
			{supplierOrder && (
				<SupplierOrderEditModalContainer supplierOrder={supplierOrder} />
			)}
		</Row>
	);
}
