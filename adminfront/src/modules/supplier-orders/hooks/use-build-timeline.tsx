import { useAdminSupplierOrder } from '@/lib/hooks/api/supplier-order';
import { useAdminSupplierOrderEdits } from '@/lib/hooks/api/supplier-order-edits';
import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';
import {
	ClaimOrder,
	Order,
	OrderEdit,
	Refund,
	Return,
	Swap,
} from '@medusajs/medusa';
import { isArray } from 'lodash';
import { useAdminNotes, useAdminNotifications, useGetCart } from 'medusa-react';
import { useMemo } from 'react';

export interface TimelineEvent {
	id: string;
	time: Date;
	first?: boolean;
	orderId: string;
	noNotification?: boolean;
	type:
		| 'payment'
		| 'note'
		| 'notification'
		| 'placed'
		| 'shipped'
		| 'delivered'
		| 'fulfilled'
		| 'canceled'
		| 'return'
		| 'refund'
		| 'exchange'
		| 'exchange_fulfilled'
		| 'claim'
		| 'edit-created'
		| 'edit-requested'
		| 'edit-declined'
		| 'edit-canceled'
		| 'edit-confirmed'
		| 'payment-required'
		| 'refund-required'
		| 'paid'
		| 'change-price'
		| 'fulfillment-delivered'
		| 'fulfillment-inventoried'
		| 'fulfillment-rejected';
}

export interface RefundRequiredEvent extends TimelineEvent {
	currency_code: string;
}

export interface PaymentRequiredEvent extends TimelineEvent {
	currency_code: string;
}

export interface OrderEditEvent extends TimelineEvent {
	edit: OrderEdit;
}

export interface OrderEditRequestedEvent extends OrderEditEvent {
	email: string;
}

interface CancelableEvent {
	canceledAt?: Date;
	isCanceled?: boolean;
}

export interface OrderPlacedEvent extends TimelineEvent {
	amount: number;
	currency_code: string;
	tax?: number;
}

interface OrderItem {
	title: string;
	quantity: number;
	thumbnail?: string;
	variant: {
		title: string;
	};
}

interface ReturnItem extends OrderItem {
	requestedQuantity: number;
	receivedQuantity: number;
}

interface FulfillmentEvent extends TimelineEvent {
	sourceType: 'claim' | 'exchange' | undefined;
}

export interface ItemsFulfilledEvent extends FulfillmentEvent {
	items: OrderItem[];
	locationName?: string;
}

export interface ItemsShippedEvent extends FulfillmentEvent {
	items: OrderItem[];
	locationName?: string;
}

export interface RefundEvent extends TimelineEvent {
	amount: number;
	reason: string;
	currencyCode: string;
	note?: string;
	refund: Refund;
}
export interface PaidEvent extends TimelineEvent {
	amount: number;
	currencyCode: string;
}

enum ReturnStatus {
	REQUESTED = 'requested',
	RECEIVED = 'received',
	REQUIRES_ACTION = 'requires_action',
	CANCELED = 'canceled',
}

export interface ReturnEvent extends TimelineEvent {
	items: ReturnItem[];
	status: ReturnStatus;
	currentStatus?: ReturnStatus;
	raw: Return;
	order: Order;
	refunded?: boolean;
}

export interface NoteEvent extends TimelineEvent {
	value: string;
	authorId: string;
}

export interface ExchangeEvent extends TimelineEvent, CancelableEvent {
	paymentStatus: string;
	fulfillmentStatus: string;
	returnStatus: string;
	returnId: string;
	returnItems: (ReturnItem | undefined)[];
	newItems: OrderItem[];
	exchangeCartId?: string;
	raw: Swap;
}

export interface ClaimEvent extends TimelineEvent, CancelableEvent {
	returnStatus: ReturnStatus;
	fulfillmentStatus?: string;
	refundStatus: string;
	refundAmount: number;
	currencyCode: string;
	claimItems: OrderItem[];
	newItems: OrderItem[];
	claimType: string;
	claim: ClaimOrder;
	order: Order;
}

export interface NotificationEvent extends TimelineEvent {
	to: string;
	title: string;
}

export const useBuildTimeline = (supplierOrderId: string) => {
	const {
		// data: supplierOrder,
		supplierOrder,
		refetch,
		isLoading: isOrderLoading,
	} = useAdminSupplierOrder(supplierOrderId);

	const { cart, isLoading: isCartLoading } = useGetCart(
		supplierOrder?.cart_id ?? '',
		{
			enabled: !!supplierOrder,
		}
	);

	const { edits, isLoading: isOrderEditsLoading } =
		useAdminSupplierOrderEdits({
			supplier_order_id: supplierOrderId,
			// limit: count, // TODO
		});

	const { isFeatureEnabled } = useFeatureFlag();

	const { notes, isLoading: isNotesLoading } = useAdminNotes({
		resource_id: supplierOrderId,
		limit: 100,
		offset: 0,
	});

	const { notifications } = useAdminNotifications({
		resource_id: supplierOrderId,
	});

	const events: TimelineEvent[] | undefined = useMemo(() => {
		if (!supplierOrder) {
			return undefined;
		}

		if (isOrderLoading || isNotesLoading || isOrderEditsLoading) {
			return undefined;
		}

		const events: TimelineEvent[] = [];

		events.push({
			id: 'refund-event',
			time: new Date(),
			orderId: supplierOrder.id,
			type: 'refund-required',
			currency_code: supplierOrder.currency_code,
		} as RefundRequiredEvent);

		events.push({
			id: 'payment-required',
			time: new Date(),
			orderId: supplierOrder.id,
			type: 'payment-required',
			currency_code: supplierOrder.currency_code,
		} as PaymentRequiredEvent);
		if (isFeatureEnabled('order_editing')) {
			for (const edit of edits || []) {
				events.push({
					id: edit.id,
					time: edit.created_at,
					orderId: supplierOrder.id,
					type: 'edit-created',
					edit: edit,
				} as OrderEditEvent);

				if (edit.requested_at) {
					events.push({
						id: edit.id,
						time: edit.requested_at,
						orderId: supplierOrder.id,
						type: 'edit-requested',
						email: supplierOrder?.user?.email,
						edit: edit,
					} as OrderEditRequestedEvent);
				}

				// declined
				if (edit.declined_at) {
					events.push({
						id: edit.id,
						time: edit.declined_at,
						orderId: supplierOrder.id,
						type: 'edit-declined',
						edit: edit,
					} as OrderEditEvent);
				}

				// canceled
				if (edit.canceled_at) {
					events.push({
						id: edit.id,
						time: edit.canceled_at,
						orderId: supplierOrder.id,
						type: 'edit-canceled',
						edit: edit,
					} as OrderEditEvent);
				}

				// confirmed
				if (edit.confirmed_at) {
					events.push({
						id: edit.id,
						time: edit.confirmed_at,
						orderId: supplierOrder.id,
						type: 'edit-confirmed',
						edit: edit,
					} as OrderEditEvent);
				}
			}
		}

		events.push({
			id: `${supplierOrder.id}-placed`,
			time: supplierOrder.created_at,
			amount: cart?.total ?? supplierOrder.total,
			currency_code: supplierOrder.currency_code,
			tax: supplierOrder.tax_rate,
			type: 'placed',
			orderId: supplierOrder.id,
		} as OrderPlacedEvent);

		if (supplierOrder.status === 'canceled') {
			events.push({
				id: `${supplierOrder.id}-canceled`,
				time: supplierOrder.updated_at,
				type: 'canceled',
				orderId: supplierOrder.id,
			} as TimelineEvent);
		}

		if (supplierOrder?.delivered_at) {
			events.push({
				id: `${supplierOrder.id}-delivered`,
				time: supplierOrder?.delivered_at,
				type: 'fulfillment-delivered',
				orderId: supplierOrder.id,
			} as TimelineEvent);
		}
		if (supplierOrder?.inventoried_at) {
			events.push({
				id: `${supplierOrder.id}-inventoried`,
				time: supplierOrder?.inventoried_at,
				type: 'fulfillment-inventoried',
				orderId: supplierOrder.id,
			} as TimelineEvent);
		}
		if (supplierOrder?.rejected_at) {
			events.push({
				id: `${supplierOrder.id}-rejected`,
				time: supplierOrder?.rejected_at,
				type: 'fulfillment-rejected',
				orderId: supplierOrder.id,
			} as TimelineEvent);
		}

		if (notes) {
			for (const note of notes) {
				events.push({
					id: note.id,
					time: note.created_at,
					type: 'note',
					authorId: note.author_id,
					value: note.value,
					orderId: supplierOrder.id,
				} as NoteEvent);
			}
		}

		for (const event of supplierOrder?.refunds as any[]) {
			events.push({
				amount: event.amount,
				currencyCode: supplierOrder.currency_code,
				id: event.id,
				note: event.note,
				reason: event.reason,
				time: event.created_at,
				type: 'refund',
				refund: event,
			} as RefundEvent);
		}

		if ((supplierOrder.metadata?.timeline as any[])?.length) {
			for (const event of supplierOrder.metadata.timeline as any[]) {
				events.push({
					...event,
					id: event.line_item_id,
					time: event.created_at,
					type: 'change-price',
					orderId: supplierOrder.id,
				} as TimelineEvent);
			}
		}

		for (const payment of supplierOrder.payments) {
			const paidData = payment.data?.paid;
			if (isArray(paidData) && paidData.length > 0) {
				for (const paid of paidData) {
					events.push({
						id: `${payment.created_at}-paid`,
						time: paid.created_at,
						type: 'paid',
						orderId: supplierOrder.id,
						amount: paid.amount,
						currencyCode: supplierOrder.currency_code,
					} as PaidEvent);
				}
			}
		}

		if (notifications) {
			for (const notification of notifications) {
				events.push({
					id: notification.id,
					time: notification.created_at,
					to: notification.to,
					type: 'notification',
					title: notification.event_name,
					orderId: supplierOrder.id,
				} as NotificationEvent);
			}
		}

		events.sort((a, b) => {
			if (a.time > b.time) {
				return -1;
			}

			if (a.time < b.time) {
				return 1;
			}

			return 0;
		});

		events[events.length - 1].first = true;

		return events;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		supplierOrder,
		edits,
		notes,
		notifications,
		isFeatureEnabled,
		isOrderLoading,
		isNotesLoading,
		isOrderEditsLoading,
		isCartLoading,
		cart,
	]);

	return {
		events,
		refetch,
	};
};

function findOriginalItemId(edits: any, originalId: any) {
	let currentId = originalId;

	edits = edits
		.filter((e: any) => !!e.confirmed_at) // only confirmed OEs are cloning line items
		.sort(
			// (a: any, b: any) => new Date(a.confirmed_at) - new Date(b.confirmed_at)
			(a: any, b: any) =>
				new Date(b.confirmed_at).getTime() - new Date(a.confirmed_at).getTime()
		);

	for (const edit of edits) {
		const clonedItem = edit.items.find(
			(e: any) => e.original_item_id === currentId
		);
		if (clonedItem) {
			currentId = clonedItem.id;
		} else {
			break;
		}
	}

	return currentId;
}
