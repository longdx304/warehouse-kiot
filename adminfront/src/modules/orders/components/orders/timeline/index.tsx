import { useState } from 'react';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import {
	ItemsFulfilledEvent,
	ItemsShippedEvent,
	OrderPlacedEvent,
	RefundEvent,
	TimelineEvent,
	PaymentRequiredEvent,
	RefundRequiredEvent,
	OrderEditEvent,
	OrderEditRequestedEvent,
	ReturnEvent,
	ExchangeEvent,
	ClaimEvent,
	PaidEvent,
	AttachmentEvent,
} from '@/modules/orders/hooks/use-build-timeline';
import {
	AdminPostOrdersOrderReq,
	Customer,
	LineItem,
	Order,
	Region,
} from '@medusajs/medusa';
import { Empty, message } from 'antd';
import { CircleAlert, FileDown, RefreshCcw, RotateCcw } from 'lucide-react';
import { useAdminOrder, useAdminUpdateOrder } from 'medusa-react';
import useOrdersExpandParam from '../utils/use-admin-expand-parameter';
import ItemsFulfilled from './timeline-events/items-fulfilled';
import ItemsShipped from './timeline-events/items-shipped';
import OrderCanceled from './timeline-events/order-canceled';
import OrderPlaced from './timeline-events/order-placed';
import Refund from './timeline-events/refund';
import Return from './timeline-events/return';
import Exchange from './timeline-events/exchange';
import Claim from './timeline-events/claim';
import PaymentRequired from './timeline-events/order-edit/payment-required';
import RefundRequired from './timeline-events/order-edit/refund-required';
import EditCreated from './timeline-events/order-edit/created';
import EditConfirmed from './timeline-events/order-edit/confirmed';
import EditCanceled from './timeline-events/order-edit/canceled';
import EditDeclined from './timeline-events/order-edit/declined';
import EditRequested from './timeline-events/order-edit/requested';
import ReturnMenu from './timeline-events/modal/returns';
import SwapModal from './timeline-events/modal/swap';
import ClaimModal from './timeline-events/modal/claim';
import Paid from './timeline-events/paid';
import ChangedPrice from './timeline-events/order-edit/changed-price';
import Attachment from './timeline-events/attachment';
import { pdfOrderRes } from '../new-order';
import { generatePdfBlob } from '../new-order/order-pdf';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { isEmpty } from 'lodash';
import { useUser } from '@/lib/providers/user-provider';
import { getErrorMessage } from '@/lib/utils';

type Props = {
	orderId: Order['id'];
	isLoading: boolean;
	refetchOrder: () => void;
	events: TimelineEvent[] | undefined;
	refetch: () => void;
};

const Timeline = ({
	orderId,
	isLoading,
	refetchOrder,
	events,
	refetch,
}: Props) => {
	const { user } = useUser();
	const { orderRelations } = useOrdersExpandParam();
	const uploadFile = useAdminUploadFile();
	const updateOrder = useAdminUpdateOrder(orderId);
	const [showRequestReturn, setShowRequestReturn] = useState<boolean>(false);
	const [showCreateSwap, setShowCreateSwap] = useState<boolean>(false);
	const [showRegisterClaim, setShowRegisterClaim] = useState<boolean>(false);
	const { order, isLoading: isOrderLoading } = useAdminOrder(
		orderId,
		{
			expand: orderRelations,
		},
		{
			enabled: showRequestReturn || showCreateSwap || showRegisterClaim,
		}
	);

	const generateFilePdf = async (): Promise<string> => {
		let pdfUrl = '';
		let pdfReq = {} as pdfOrderRes;
		if (!isEmpty(order)) {
			const { items, shipping_address } = order!;
			const address = `${shipping_address?.address_1 ?? ''}, ${
				shipping_address?.address_2 ?? ''
			}, ${shipping_address?.province ?? ''}, ${
				shipping_address?.city ?? ''
			}, ${shipping_address?.country_code ?? ''}`;

			pdfReq = {
				email: order!.customer.email,
				userId: user!.id,
				user: user,
				customer: {
					first_name: order!.customer.first_name,
					last_name: order!.customer.last_name,
					email: order!.customer.email,
					phone: order!.customer.phone,
				},
				address,
				lineItems:
					items?.map((i: LineItem) => ({
						variantId: i.variant_id ?? '',
						quantity: i.quantity,
						unit_price: i.unit_price,
						title: `${i.title} - ${i.description}`,
					})) ?? [],
				totalQuantity: items.reduce((acc, i) => acc + i.quantity, 0),
				countryCode: shipping_address!.country_code!,
				isSendEmail: false,
			};

			// Generate pdf blob
			const pdfBlob = await generatePdfBlob(pdfReq!);

			// Create a File object
			const fileName = `purchase-order.pdf`;

			// Create a File object
			const files = new File([pdfBlob], fileName, {
				type: 'application/pdf',
			});

			// Upload pdf to s3 using Medusa uploads API
			const uploadRes = await uploadFile.mutateAsync({
				files,
				prefix: 'orders',
			});

			pdfUrl = uploadRes.uploads[0].url;
		}

		return pdfUrl;
	};

	const updateDocFileOrder = async () => {
		message.loading('Đang cập nhật file order...');
		const pdfUrl = await generateFilePdf();

		let files: any[] = Array.isArray(order?.metadata?.files)
			? order.metadata.files
			: [];

		await updateOrder.mutateAsync(
			{
				metadata: {
					files: [
						...files,
						{
							url: pdfUrl,
							name: 'Order PDF',
							created_at: new Date().toISOString(),
						},
					],
				},
			} as AdminPostOrdersOrderReq & { metadata: { files: any[] } },
			{
				onSuccess: () => {
					refetchOrder();
					message.success('Cập nhật file order thành công');
				},
				onError: (err: any) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const actions = [
		{
			label: <span className="w-full">{'Yêu cầu trả hàng'}</span>,
			key: 'require_return',
			icon: <RotateCcw size={18} />,
			onClick: () => setShowRequestReturn(true),
		},
		{
			label: <span className="w-full">{'Đăng ký trao đổi'}</span>,
			key: 'exchange',
			icon: <RefreshCcw size={18} />,
			onClick: () => setShowCreateSwap(true),
		},
		{
			label: <span className="w-full">{'Đăng ký đòi hỏi'}</span>,
			key: 'claim',
			icon: <CircleAlert size={18} />,
			onClick: () => setShowRegisterClaim(true),
		},
		{
			label: <span className="w-full">{'Cập nhật file order'}</span>,
			key: 'update-file',
			icon: <FileDown size={18} />,
			onClick: updateDocFileOrder,
		},
	];

	if (!events?.length) {
		return (
			<Card loading={isLoading || isOrderLoading}>
				<Empty description="Chưa có sự kiện nào xảy ra" />
			</Card>
		);
	}

	return (
		<Card
			loading={isLoading || isOrderLoading}
			className="px-4 max-h-[calc(100vh-80px)] overflow-y-auto sticky top-[20px]"
		>
			<div>
				<Flex align="center" justify="space-between" className="pb-4">
					<Title level={4}>{`Dòng thời gian`}</Title>
					<div className="flex justify-end items-center gap-4">
						<ActionAbles actions={actions} />
					</div>
				</Flex>
				<div className="flex flex-col text-xs">
					{events?.map((event, i) => {
						return (
							<div key={i}>
								{switchOnType(event, refetch, refetchOrder, order?.region)}
							</div>
						);
					})}
				</div>
			</div>
			{showRequestReturn && order && (
				<ReturnMenu
					order={order}
					state={showRequestReturn}
					onClose={() => setShowRequestReturn(false)}
				/>
			)}
			{showCreateSwap && order && (
				<SwapModal
					order={order}
					state={showCreateSwap}
					onClose={() => setShowCreateSwap(false)}
				/>
			)}
			{showRegisterClaim && order && (
				<ClaimModal
					order={order}
					state={showRegisterClaim}
					onClose={() => setShowRegisterClaim(false)}
				/>
			)}
		</Card>
	);
};

export default Timeline;

function switchOnType(
	event: TimelineEvent,
	refetch: () => void,
	refetchOrder: () => void,
	region: Region | undefined
) {
	switch (event.type) {
		case 'placed':
			return <OrderPlaced event={event as OrderPlacedEvent} />;
		case 'fulfilled':
			return <ItemsFulfilled event={event as ItemsFulfilledEvent} />;
		// case "note":
		//   return <Note event={event as NoteEvent} />
		case 'shipped':
			return <ItemsShipped event={event as ItemsShippedEvent} />;
		case 'canceled':
			return <OrderCanceled event={event as TimelineEvent} />;
		case 'return':
			return (
				<Return
					event={event as ReturnEvent}
					refetch={refetch}
					refetchOrder={refetchOrder}
				/>
			);
		case 'exchange':
			return (
				<Exchange
					refetchOrder={refetchOrder}
					key={event.id}
					event={event as ExchangeEvent}
					refetch={refetch}
				/>
			);
		case 'claim':
			return (
				<Claim
					refetchOrder={refetchOrder}
					event={event as ClaimEvent}
					refetch={refetch}
				/>
			);
		// case "notification":
		//   return <Notification event={event as NotificationEvent} />
		case 'refund':
			return <Refund event={event as RefundEvent} />;
		case 'paid':
			return <Paid event={event as PaidEvent} />;
		case 'edit-created':
			return (
				<EditCreated
					event={event as OrderEditEvent}
					refetchOrder={refetchOrder}
				/>
			);
		case 'edit-canceled':
			return <EditCanceled event={event as OrderEditEvent} />;
		case 'edit-declined':
			return <EditDeclined event={event as OrderEditEvent} />;
		case 'edit-confirmed':
			return <EditConfirmed event={event as OrderEditEvent} />;
		case 'edit-requested':
			return <EditRequested event={event as OrderEditRequestedEvent} />;
		case 'refund-required':
			return <RefundRequired event={event as RefundRequiredEvent} />;
		case 'payment-required':
			return <PaymentRequired event={event as PaymentRequiredEvent} />;
		case 'change-price':
			return <ChangedPrice event={event as any} region={region} />;
		case 'attachment':
			return <Attachment event={event as AttachmentEvent} />;
		default:
			return null;
	}
}
