import { useAdminOrder, useAdminOrderEdits } from 'medusa-react';
import React, { useState } from 'react';

import { RefundRequiredEvent } from '@/modules/orders/hooks/use-build-timeline';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Button } from '@/components/Button';
import { CircleAlert } from 'lucide-react';
import EventContainer, { EventIconColor } from '../event-container';
import RefundModal from '../../../payment/refund-modal';
// import CreateRefundModal from "../../../../domain/orders/details/refund"

type RequestedProps = {
	event: RefundRequiredEvent;
};

const RefundRequired: React.FC<RequestedProps> = ({ event }) => {
	const { order } = useAdminOrder(event.orderId);

	const { order_edits: edits } = useAdminOrderEdits({
		order_id: event.orderId,
	});

	const requestedEditDifferenceDue =
		edits?.find((e) => e.status === 'requested')?.difference_due || 0;

	const [showRefundModal, setShowRefundModal] = useState(false);

	if (!order || !edits) {
		return null;
	}

	const refundableAmount =
		order.paid_total -
		order.refunded_total -
		order.total -
		requestedEditDifferenceDue;

	if (refundableAmount <= 0) {
		return null;
	}

	return (
		<>
			<EventContainer
				title={'Yêu cầu hoàn tiền'}
				icon={<CircleAlert size={20} />}
				iconColor={EventIconColor.RED}
				time={event.time}
				isFirst={event.first}
			>
				<Button
					onClick={() => setShowRefundModal(true)}
					type="default"
					className="border-gray-200 w-full text-rose-500"
				>
					Hoàn tiền{' '}
					{formatAmountWithSymbol({
						amount: refundableAmount,
						currency: event.currency_code,
					})}
				</Button>
			</EventContainer>
			{showRefundModal && (
				<RefundModal
					state={showRefundModal}
					handleOk={() => setShowRefundModal(false)}
					handleCancel={() => setShowRefundModal(false)}
					order={order}
					initialAmount={refundableAmount}
					initialReason="other"
					refetch={() => {}}
				/>
			)}
		</>
	);
};

export default RefundRequired;
