import { message, Modal } from 'antd';
import {
	useAdminCancelReturn,
	useAdminCancelSwap,
	useAdminOrder,
	useAdminStore,
} from 'medusa-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { TooltipIcon } from '@/components/Tooltip';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import CreateFulfillmentModal from '@/modules/orders/components/orders/fulfillment/create-fulfillment-modal';
import useOrdersExpandParam from '@/modules/orders/components/orders/utils/use-admin-expand-parameter';
import { ExchangeEvent } from '@/modules/orders/hooks/use-build-timeline';
import Medusa from '@/services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
	Ban,
	CircleAlert,
	CircleDollarSign,
	CircleX,
	CreditCard,
	RefreshCw,
	Truck,
} from 'lucide-react';
import EventActionables from './event-actionables';
import EventContainer, { EventIconColor } from './event-container';
import EventItemContainer from './event-item-container';
import ReceiveReturnModal from './modal/receive-return';
import SwapCheckoutModal from './modal/swap-checkout';
import { FulfillmentStatus, PaymentStatus, ReturnStatus } from './order-status';

dayjs.locale('vi');
type ExchangeProps = {
	event: ExchangeEvent;
	refetch: () => void;
	refetchOrder: () => void;
};

type ExchangeStatusProps = {
	event: ExchangeEvent;
};

const ExchangeStatus: React.FC<ExchangeStatusProps> = ({ event }) => {
	const divider = <div className="bg-gray-200 h-11 w-[1px]" />;

	return (
		<div className="gap-x-2 flex items-center">
			<div className="gap-y-2 flex flex-col">
				<span className="text-gray-500">Thanh toán:</span>
				<PaymentStatus paymentStatus={event.paymentStatus} />
			</div>
			{divider}
			<div className="gap-y-2 flex flex-col">
				<span className="text-gray-500">Trả hàng:</span>
				<ReturnStatus returnStatus={event.returnStatus} />
			</div>
			{divider}
			<div className="gap-y-2 flex flex-col">
				<span className="text-gray-500">Đóng gói:</span>
				<FulfillmentStatus fulfillmentStatus={event.fulfillmentStatus} />
			</div>
		</div>
	);
};

const Exchange: React.FC<ExchangeProps> = ({
	event,
	refetch,
	refetchOrder,
}) => {
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
	const {
		state: stateSwapCheckout,
		onClose: closeSwapCheckout,
		onOpen: openSwapCheckout,
	} = useToggleState(false);
	const cancelExchange = useAdminCancelSwap(event.orderId);
	const cancelReturn = useAdminCancelReturn(event.returnId);
	const [differenceCardId, setDifferenceCardId] = useState<string | undefined>(
		undefined
	);
	const [paymentFormatWarning, setPaymentFormatWarning] = useState<
		string | undefined
	>(undefined);
	const [payable, setPayable] = useState<boolean>(true);
	const { store } = useAdminStore();
	const { orderRelations } = useOrdersExpandParam();
	const { order } = useAdminOrder(event.orderId, {
		expand: orderRelations,
	});

	useEffect(() => {
		if (!store) {
			return;
		}

		if (event.paymentStatus !== 'not_paid') {
			setPayable(false);
			return;
		}

		if (store.swap_link_template?.indexOf('{cart_id}') === -1) {
			setPaymentFormatWarning(
				"Liên kết thanh toán của cửa hàng không có định dạng mặc định vì nó không chứa '{cart_id}'. Bạn cần cập nhật liên kết thanh toán để bao gồm '{cart_id}' hoặc cập nhật phương thức này để phản ánh định dạng của liên kết thanh toán của bạn."
			);
		}

		if (!store.swap_link_template) {
			setPaymentFormatWarning(
				'Chưa có liên kết thanh toán nào được thiết lập cho cửa hàng này. Vui lòng cập nhật cài đặt của cửa hàng.'
			);
		}

		if (event.exchangeCartId) {
			setDifferenceCardId(
				store.swap_link_template?.replace(/\{cart_id\}/, event.exchangeCartId)
			);
		}
	}, [
		store?.swap_link_template,
		event.exchangeCartId,
		event.paymentStatus,
		store,
	]);

	const paymentLink = getPaymentLink(
		payable,
		differenceCardId,
		paymentFormatWarning,
		event.exchangeCartId
	);

	const handleCancelExchange = async () => {
		Modal.confirm({
			title: 'Bạn có muốn huỷ yêu cầu trao đổi hàng ?',
			content:
				'Yêu cầu trao đổi hàng sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn thực hiện chứ?',
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
				await cancelExchange.mutateAsync(event.id, {
					onSuccess: () => {
						refetch();
						message.success('Huỷ trao đổi thành công!');
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
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
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			},
		});
	};

	const handleProcessSwapPayment = () => {
		Medusa.orders
			.processSwapPayment(event.orderId, event.id)
			.then((_res) => {
				message.success('Thanh toán được xử lý thành công');
				refetch();
				refetchOrder();
			})
			.catch((err) => {
				message.error(getErrorMessage(err));
			});
	};

	const returnItems = getReturnItems(event);
	const newItems = getNewItems(event);

	const actions: any = [];

	const handleSwapCheckout = async () => {
		openSwapCheckout();
	};

	if (event.paymentStatus === 'not_paid') {
		actions.push({
			label: 'Tạo phiên thanh toán',
			icon: <CreditCard size={20} />,
			onClick: handleSwapCheckout,
		});
	}
	if (event.paymentStatus === 'awaiting') {
		actions.push({
			label: 'Thanh toán',
			icon: <CircleDollarSign size={20} />,
			onClick: handleProcessSwapPayment,
		});
	}

	if (event.returnStatus === 'requested') {
		actions.push({
			label: 'Huỷ trả hàng',
			icon: <Truck size={20} />,
			onClick: () => handleCancelReturn(),
		});
	}

	if (
		!event.isCanceled &&
		!event.canceledAt &&
		event.fulfillmentStatus !== 'fulfilled' &&
		event.fulfillmentStatus !== 'shipped'
	) {
		actions.push({
			label: 'Huỷ trao đổi',
			icon: <Ban size={20} />,
			onClick: () => handleCancelExchange(),
			danger: true,
		});
	}

	const handleRefresh = () => {
		refetch();
		refetchOrder();
	};
	const args = {
		title: event.canceledAt ? 'Trao đổi đã bị huỷ' : 'Yêu cầu trao đổi',
		icon: event.canceledAt ? <CircleX size={20} /> : <RefreshCw size={20} />,
		expandable: !!event.canceledAt,
		iconColor: event.canceledAt
			? EventIconColor.DEFAULT
			: EventIconColor.ORANGE,
		time: event.time,
		noNotification: event.noNotification,
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
				{!event.canceledAt && <ExchangeStatus event={event} />}
				{!event.canceledAt && paymentLink}
				{returnItems}
				{newItems}
				<div className="gap-x-2 flex items-center">
					{event.returnStatus === 'requested' && (
						<Button
							type="default"
							onClick={openReceiveReturn}
							className="font-medium w-full"
						>
							Nhận hàng
						</Button>
					)}
					{event.fulfillmentStatus === 'not_fulfilled' && (
						<Button
							type="default"
							onClick={openCreateFulfillment}
							className="font-medium w-full"
						>
							Đóng gói
						</Button>
					)}
				</div>
			</div>,
		],
	};
	return (
		<>
			<EventContainer {...args} />
			{stateReceiveReturn && order && (
				<ReceiveReturnModal
					refetchOrder={refetchOrder}
					order={order}
					returnRequest={event.raw.return_order}
					onClose={closeReceiveReturn}
					state={stateReceiveReturn}
				/>
			)}
			{stateCreateFulfillment && (
				<CreateFulfillmentModal
					state={stateCreateFulfillment}
					orderToFulfill={event.raw as any}
					handleCancel={closeCreateFulfillment}
					orderId={event.orderId}
					handleOk={closeCreateFulfillment}
					refetch={handleRefresh}
				/>
			)}
			{stateSwapCheckout && order && (
				<SwapCheckoutModal
					state={stateSwapCheckout}
					order={order}
					onClose={closeSwapCheckout}
					cartId={event.raw.cart_id}
					refetch={handleRefresh}
				/>
			)}
		</>
	);
};

function getNewItems(event: ExchangeEvent) {
	return (
		<div className="gap-y-2 flex flex-col">
			<span className="text-gray-500">Sản phẩm mới</span>
			<div>
				{event.newItems.map((i, index) => (
					<EventItemContainer key={index} item={i} />
				))}
			</div>
		</div>
	);
}

function getPaymentLink(
	payable: boolean,
	differenceCardId: string | undefined,
	paymentFormatWarning: string | undefined,
	exchangeCartId: string | undefined
) {
	return payable ? (
		<div className="text-xs font-normal gap-y-2 text-gray-500 flex flex-col">
			<div className="gap-x-2 flex items-center">
				{paymentFormatWarning && (
					<TooltipIcon
						title={paymentFormatWarning}
						icon={<CircleAlert size={20} className="text-gray-400" />}
					/>
				)}
				<span>Link thanh toán:</span>
			</div>
		</div>
	) : null;
}

function getReturnItems(event: ExchangeEvent) {
	return (
		<div className="gap-y-2 flex flex-col">
			<span className="text-gray-500">Sản phẩm trả lại</span>
			<div>
				{event.returnItems
					.filter((i) => !!i)
					.map((i: any) => (
						<EventItemContainer
							key={i.id}
							item={{ ...i, quantity: i.requestedQuantity }}
						/>
					))}
			</div>
		</div>
	);
}

function getActions(event: ExchangeEvent, actions: any) {
	if (actions.length === 0) {
		return null;
	}

	return <EventActionables actions={actions} />;
}

export default Exchange;
