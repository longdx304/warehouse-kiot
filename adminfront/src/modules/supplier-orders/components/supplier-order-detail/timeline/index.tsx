import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Title } from '@/components/Typography';
import {
	useAdminSupplierOrder,
	useMarkAsFulfilledMutation,
} from '@/lib/hooks/api/supplier-order';
import { getErrorMessage } from '@/lib/utils';
import {
	ItemsShippedEvent,
	OrderEditEvent,
	OrderEditRequestedEvent,
	OrderPlacedEvent,
	PaymentRequiredEvent,
} from '@/modules/orders/hooks/use-build-timeline';
// import { useAdminSupplierOrder } from '@/modules/supplier/hooks';
import {
	NoteEvent,
	PaidEvent,
	RefundEvent,
	TimelineEvent,
} from '@/modules/supplier-orders/hooks/use-build-timeline';
import { FulfillSupplierOrderStt, SupplierOrder } from '@/types/supplier';
import { Region } from '@medusajs/medusa';
import { Empty, MenuProps, message } from 'antd';
import {
	ArrowLeft,
	PackageCheck,
	PackageX,
	SendHorizontal,
} from 'lucide-react';
import { useAdminCreateNote } from 'medusa-react';
import { ChangeEvent, useState } from 'react';
import Fulfillment from './timeline-events/fulfillment';
import ItemsShipped from './timeline-events/items-shipped';
import Note from './timeline-events/note';
import OrderCanceled from './timeline-events/order-canceled';
import EditCanceled from './timeline-events/order-edit/canceled';
import ChangedPrice from './timeline-events/order-edit/changed-price';
import EditConfirmed from './timeline-events/order-edit/confirmed';
import EditCreated from './timeline-events/order-edit/created';
import EditDeclined from './timeline-events/order-edit/declined';
import PaymentRequired from './timeline-events/order-edit/payment-required';
import EditRequested from './timeline-events/order-edit/requested';
import OrderPlaced from './timeline-events/order-placed';
import Paid from './timeline-events/paid';
import Refund from './timeline-events/refund';
import { useRouter } from 'next/navigation';
import { ERoutes } from '@/types/routes';

type Props = {
	orderId: SupplierOrder['id'];
	isLoading: boolean;
	refetchOrder: () => void;
	events: TimelineEvent[] | undefined;
	refetch: () => void;
};

const Timeline = ({ orderId, isLoading, events, refetch }: Props) => {
	const router = useRouter();
	const createNote = useAdminCreateNote();
	const [inputValue, setInputValue] = useState<string>('');
	const changeSttFulfilled = useMarkAsFulfilledMutation(orderId);

	const {
		supplierOrder: order,
		isLoading: isOrderLoading,
		refetch: refetchSupplierOrder,
	} = useAdminSupplierOrder(orderId);

	const isOrderCanceled = order?.status === 'canceled';

	if (!events?.length) {
		return (
			<Card loading={isLoading || isOrderLoading}>
				<Empty description="Chưa có sự kiện nào xảy ra" />
			</Card>
		);
	}

	const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;

		setInputValue(inputValue);
	};

	const onSubmit = () => {
		if (!inputValue) {
			return;
		}
		createNote.mutate(
			{
				resource_id: orderId!,
				resource_type: 'supplier_order',
				value: inputValue,
			},
			{
				onSuccess: () => {
					message.success('Ghi chú đã được tạo');
				},
				onError: (err) => message.error(getErrorMessage(err)),
			}
		);
		setInputValue('');
	};

	const handleMarkAsFulfilled = () => {
		changeSttFulfilled.mutateAsync(
			{
				status: FulfillSupplierOrderStt.DELIVERED,
			},
			{
				onSuccess: () => {
					message.success('Đã xác nhận hàng đã về kho thành công');
					refetch();
					refetchSupplierOrder();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const handleCancelAsFulfilled = () => {
		changeSttFulfilled.mutateAsync(
			{
				status: FulfillSupplierOrderStt.REJECTED,
			},
			{
				onSuccess: () => {
					message.success('Đã đánh dấu huỷ nhận hàng thành công');
					refetch();
					refetchSupplierOrder();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const actions = [
		[
			FulfillSupplierOrderStt.NOT_FULFILLED,
			FulfillSupplierOrderStt.REJECTED,
		].includes(order?.fulfillment_status as FulfillSupplierOrderStt) && {
			key: 'mark_as_fulfilled',
			label: 'Xác nhận hàng đã về kho',
			icon: <PackageCheck size={18} />,
			onClick: handleMarkAsFulfilled,
			disabled: isOrderCanceled
		},
		[
			FulfillSupplierOrderStt.DELIVERED,
			FulfillSupplierOrderStt.INVENTORIED,
		].includes(order?.fulfillment_status as FulfillSupplierOrderStt) && {
			key: 'inbound_detail',
			label: 'Trang nhập hàng chi tiết',
			icon: <ArrowLeft size={18} />,
			disabled: isOrderCanceled,
			onClick: () => {
				router.push(`${ERoutes.WAREHOUSE_INBOUND}/${orderId}`);
			},
		},
	];
	return (
		<Card
			loading={isLoading || isOrderLoading}
			className="px-4 max-h-[calc(100vh-80px)] overflow-y-auto sticky top-[20px]"
		>
			<div>
				<Flex align="center" justify="space-between" className="pb-4">
					<Title level={4}>{`Dòng thời gian`}</Title>
					<div className="flex justify-end items-center gap-4">
						<ActionAbles actions={actions as any} />
					</div>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					className="pb-4 w-full border-solid border-0 border-b border-gray-200"
					gap={4}
				>
					<Input
						value={inputValue}
						onChange={onChangeInput}
						placeholder="Nhập ghi chú"
						className="w-full"
					/>
					<Button
						className="h-[40px]"
						type="default"
						icon={<SendHorizontal size={16} />}
						onClick={onSubmit}
					/>
				</Flex>
				<div className="flex flex-col text-xs pt-4">
					{events?.map((event, i) => {
						return <div key={i}>{switchOnType(event, order?.region)}</div>;
					})}
				</div>
			</div>
		</Card>
	);
};

export default Timeline;

function switchOnType(event: TimelineEvent, region: Region | undefined) {
	switch (event.type) {
		case 'refund':
			return <Refund event={event as RefundEvent} />;
		case 'placed':
			return <OrderPlaced event={event as OrderPlacedEvent} />;
		case 'note':
			return <Note event={event as NoteEvent} />;
		case 'shipped':
			return <ItemsShipped event={event as ItemsShippedEvent} />;
		case 'canceled':
			return <OrderCanceled event={event as TimelineEvent} />;
		case 'edit-created':
			return <EditCreated event={event as OrderEditEvent} />;
		case 'edit-canceled':
			return <EditCanceled event={event as OrderEditEvent} />;
		case 'edit-declined':
			return <EditDeclined event={event as OrderEditEvent} />;
		case 'edit-confirmed':
			return <EditConfirmed event={event as OrderEditEvent} />;
		case 'edit-requested':
			return <EditRequested event={event as OrderEditRequestedEvent} />;
		case 'payment-required':
			return <PaymentRequired event={event as PaymentRequiredEvent} />;
		case 'change-price':
			return <ChangedPrice event={event as any} region={region} />;
		case 'paid':
			return <Paid event={event as PaidEvent} />;
		case 'fulfillment-delivered':
		case 'fulfillment-inventoried':
		case 'fulfillment-rejected':
			return <Fulfillment event={event as TimelineEvent} />;
		default:
			return null;
	}
}
