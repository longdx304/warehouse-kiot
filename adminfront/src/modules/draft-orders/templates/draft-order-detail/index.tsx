'use client';
import { Col, Row } from 'antd';
import { useAdminDraftOrder } from 'medusa-react';
import BackToDorders from '../../components/back-to-dorders';
import Information from '../../components/information';
import CustomerInfo from '../../components/customer-info';
import Summary from '../../components/summary';

interface Props {
	id: string;
}

export default function DraftOrderDetail({ id }: Readonly<Props>) {
	const { draft_order, isLoading, refetch } = useAdminDraftOrder(id);

	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToDorders />
			</Col>
			<Col xs={24} lg={24} className="flex flex-col gap-y-4">
				<Information dorder={draft_order} isLoading={isLoading} />
				<Summary dorder={draft_order} isLoading={isLoading} />
				<CustomerInfo dorder={draft_order} isLoading={isLoading} />
			</Col>
		</Row>
	);
}
