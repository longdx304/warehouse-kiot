import {
	useAdminCancelClaim,
	useAdminCancelReturn,
	useAdminOrder,
} from 'medusa-react';
import React from 'react';
import { message, Modal } from 'antd';

import useToggleState from '@/lib/hooks/use-toggle-state';
import CreateFulfillmentModal from '@/modules/orders/components/orders/fulfillment/create-fulfillment-modal';
import ReceiveReturnModal from './modal/receive-return';
import useOrdersExpandParam from '@/modules/orders/components/orders/utils/use-admin-expand-parameter';
import { ClaimEvent } from '@/modules/orders/hooks/use-build-timeline';
import { getErrorMessage } from '@/lib/utils';
// import CopyToClipboard from "../../atoms/copy-to-clipboard"
import { FulfillmentStatus, RefundStatus, ReturnStatus } from './order-status';
import EventContainer, { EventIconColor } from './event-container';
import EventItemContainer from './event-item-container';
import { CircleAlert, Ban, Truck, CircleX, AlertCircle } from 'lucide-react';
import EventActionables from './event-actionables';
import { Button } from '@/components/Button';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

type ClaimProps = {
	event: ClaimEvent;
	refetch: () => void;
	refetchOrder: () => void;
};

type ClaimStatusProps = {
	event: ClaimEvent;
};

const ClaimStatus: React.FC<ClaimStatusProps> = ({ event }) => {
	const divider = <div className="bg-gray-200 h-11 w-[1px]" />;

	const shouldHaveFulfillment =
		!!event.claim?.fulfillment_status &&
		event.claim?.additional_items?.length > 0;
	const shouldHaveReturnStatus = !!event.claim?.return_order;

	let refundStatus: string = event.claim?.payment_status;

	if (event.claim?.type === 'replace') {
		refundStatus =
			event.claim?.return_order?.status === 'received'
				? 'refunded'
				: event.claim?.payment_status;
	}

	if (event.canceledAt !== null) {
		refundStatus = 'canceled';
	}

	return (
		<div className="gap-x-2 flex items-center">
			<div className="gap-y-2 flex flex-col">
				<span className="text-gray-500">Hoàn trả:</span>
				<RefundStatus refundStatus={refundStatus} />
			</div>
			{shouldHaveReturnStatus && (
				<>
					{divider}
					<div className="gap-y-2 flex flex-col">
						<span className="text-gray-500">Trả hàng:</span>
						<ReturnStatus returnStatus={event.returnStatus} />
					</div>
				</>
			)}
			{shouldHaveFulfillment && (
				<>
					{divider}
					<div className="gap-y-2 flex flex-col">
						<span className="text-gray-500">Đóng gói:</span>
						<FulfillmentStatus
							fulfillmentStatus={event.claim?.fulfillment_status}
						/>
					</div>
				</>
			)}
		</div>
	);
};

const Claim: React.FC<ClaimProps> = ({ event, refetch, refetchOrder }) => {
	const {
		state: stateReceiveReturn,
		onClose: closeReceiveReturn,
		onOpen: openReceiveReturn,
	} = useToggleState(false);
	const {
		state: stateCreateFulfillment,
		onClose: closeCreateFulfillment,
		onOpen: openCreateFulfillment,
	} = useToggleState(false);

	const cancelReturn = useAdminCancelReturn(event.claim?.return_order?.id);
	const cancelClaim = useAdminCancelClaim(event.order?.id);

	const { orderRelations } = useOrdersExpandParam();
	const { order } = useAdminOrder(event.orderId, {
		expand: orderRelations,
	});

	const shouldHaveButtonActions =
		!event.canceledAt &&
		(event.claim?.return_order || event.claim?.additional_items?.length > 0);

	const handleCancelClaim = async () => {
		Modal.confirm({
			title: 'Bạn có muốn huỷ khiếu nại sản phẩm ?',
			content:
				'Yêu cầu khiếu nại sản phẩm sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn thực hiện chứ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				await cancelClaim.mutateAsync(event.claim.id, {
					onSuccess: () => {
						refetch();
						message.success('Huỷ khiếu nại thành công!');
						return;
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
						return;
					},
				});
			},
		});
	};

	const handleCancelReturn = async () => {
		Modal.confirm({
			title: 'Bạn có muốn huỷ trả hàng ?',
			content:
				'Yêu cầu trả đổi hàng sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn thực hiện chứ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				cancelReturn.mutateAsync(undefined, {
					onSuccess: () => {
						refetch();
						message.success('Huỷ trả hàng thành công!');
						return;
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
						return;
					},
				});
			},
		});
	};

	const returnItems = getReturnItems(event);
	const replaceItems = getReplaceItems(event);

	const actions: any = [];

	if (
		event.claim?.return_order &&
		event.claim.return_order?.status === 'requested'
	) {
		actions.push({
			label: 'Huỷ trả hàng',
			icon: <Truck size={20} />,
			onClick: () => handleCancelReturn(),
			danger: true,
		});
	}

	if (event.refundStatus !== 'refunded' && !event.isCanceled) {
		actions.push({
			label: 'Huỷ khiếu nại',
			icon: <Ban size={20} />,
			onClick: () => handleCancelClaim(),
			danger: true,
		});
	}

	const args = {
		title: event.canceledAt ? 'Khiếu nại đã bị huỷ' : 'Yêu cầu khiếu nại',
		icon: event.canceledAt ? <CircleX size={20} /> : <AlertCircle size={20} />,
		iconColor: event.canceledAt
			? EventIconColor.DEFAULT
			: EventIconColor.ORANGE,
		time: event.canceledAt ? event.canceledAt : event.time,
		expandable: !!event.canceledAt,
		topNode: getActions(event, actions),
		children: [
			<div className="gap-y-2 flex flex-col" key={event.id}>
				{event.canceledAt && (
					<div>
						<span className="font-medium mr-2">Yêu cầu huỷ:</span>
						<span className="text-gray-500">
							{dayjs(event.time).format('DD MMM YYYY HH:mm:ss')}
						</span>
					</div>
				)}
				<ClaimStatus event={event} />
				{returnItems}
				{event.claim?.additional_items?.length > 0 && replaceItems}
				{shouldHaveButtonActions && (
					<div className="gap-x-2 flex items-center">
						{event.claim.return_order?.status === 'requested' && (
							<Button
								type="default"
								onClick={openReceiveReturn}
								className="font-medium w-full"
							>
								Nhận hàng
							</Button>
						)}
						{event.claim?.additional_items?.length > 0 &&
							event.fulfillmentStatus === 'not_fulfilled' && (
								<Button
									type="default"
									onClick={openCreateFulfillment}
									className="font-medium w-full"
								>
									Đóng gói
								</Button>
							)}
					</div>
				)}
			</div>,
		],
	};
	return (
		<>
			<EventContainer {...args} />
			{stateReceiveReturn && (
				<ReceiveReturnModal
					refetchOrder={refetchOrder}
					order={event.order}
					returnRequest={event.claim.return_order}
					onClose={closeReceiveReturn}
					state={stateReceiveReturn}
				/>
			)}
			{stateCreateFulfillment && (
				<CreateFulfillmentModal
					refetch={refetch}
					state={stateCreateFulfillment}
					orderToFulfill={event.claim as any}
					handleCancel={closeCreateFulfillment}
					orderId={event.claim.order_id}
					handleOk={closeCreateFulfillment}
				/>
			)}
		</>
	);
};

function getReplaceItems(event: ClaimEvent) {
	return (
		<div className="gap-y-2 flex flex-col">
			<span className="text-gray-500">Sản phẩm thay thế</span>
			<div>
				{event.newItems.map((i, index) => (
					<EventItemContainer key={index} item={i} />
				))}
			</div>
		</div>
	);
}

function getReturnItems(event: ClaimEvent) {
	return (
		<div className="gap-y-2 flex flex-col">
			<span className="text-gray-500">Sản phẩm trả lại</span>
			<div>
				{event.claimItems
					.filter((i) => !!i)
					.map((i: any) => (
						<EventItemContainer key={i.id} item={i} />
					))}
			</div>
		</div>
	);
}

function getActions(event: ClaimEvent, actions: any[]) {
	if (actions.length === 0) {
		return null;
	}

	return <EventActionables actions={actions} />;
}

export default Claim;
