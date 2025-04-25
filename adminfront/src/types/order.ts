import { FormImage, Option } from '@/types/shared';
import {
	Order as MedusaOrder,
	User,
	AdminPostOrdersOrderFulfillmentsReq as MAdminPostOrdersOrderFulfillmentsReq,
} from '@medusajs/medusa';

export type Order = MedusaOrder & {
	handler_id?: string;
	handler?: User;
	handled_at?: string;
	checker_id?: string;
	checker?: User;
	checker_url?: string;
	checked_at?: string;
};

export type AddressPayload = {
	first_name: string;
	last_name: string;
	company: string | null;
	address_1: string;
	address_2: string | null;
	city: string;
	province: string | null;
	country_code: Option;
	postal_code: string;
	phone: string | null;
	metadata: any;
};

export enum AddressType {
	SHIPPING = 'shipping',
	BILLING = 'billing',
	LOCATION = 'location',
}

export type ClaimTypeFormType = {
	type: 'replace' | 'refund';
};

export type ReceiveReturnItem = {
	item_id: string;
	thumbnail?: string | null;
	product_title: string;
	variant_title: string;
	sku?: string | null;
	quantity: number;
	original_quantity: number;
	refundable?: number | null;
	receive: boolean;
	price: number;
};

export type ItemsToReceiveFormType = {
	items: ReceiveReturnItem[];
};

export type ReturnReasonDetails = {
	note?: string;
	reason?: Option;
	images?: FormImage[];
};

export type ReturnItem = {
	item_id: string;
	thumbnail?: string | null;
	product_title: string;
	variant_title: string;
	sku?: string | null;
	quantity: number;
	original_quantity: number;
	total: number;
	refundable?: number | null;
	return_reason_details: ReturnReasonDetails;
	return: boolean;
};

export type ItemsToReturnFormType = {
	items: ReturnItem[];
};

export type AdditionalItem = {
	variant_id: string;
	thumbnail?: string | null;
	product_title: string;
	sku?: string;
	variant_title: string;
	quantity: number;
	in_stock: number;
	price: number;
	original_price: number;
};

export type ItemsToSendFormType = {
	items: AdditionalItem[];
};

export type SendNotificationFormType = {
	send_notification: boolean;
};

export type ShippingFormType = {
	option: {
		label: string;
		value: {
			id: string;
			taxRate: number;
		};
	} | null;
	price?: number;
};

export type RefundAmountFormType = {
	amount?: number;
};

export type CreateClaimFormType = {
	notification: SendNotificationFormType;
	return_items: ItemsToReturnFormType;
	additional_items: ItemsToSendFormType;
	return_shipping: ShippingFormType;
	selected_location?: {
		value: string;
		label: string;
	};
	replacement_shipping: ShippingFormType;
	shipping_address: AddressPayload;
	claim_type: ClaimTypeFormType;
	refund_amount: RefundAmountFormType;
};

export type ReceiveReturnFormType = {
	receive_items: ItemsToReceiveFormType;
	refund_amount: RefundAmountFormType;
};

export type AddressLocationFormType = {
	address_1: string;
	address_2: string | null;
	city: string;
	province: string | null;
	country_code: string | Option;
	postal_code: string;
};

export type AddressContactFormType = {
	first_name: string;
	last_name: string;
	company: string | null;
	phone: string | null;
};

export enum FulfillmentStatus {
	/**
	 * The order's items are not fulfilled.
	 */
	NOT_FULFILLED = 'not_fulfilled',
	/**
	 * Some of the order's items, but not all, are fulfilled.
	 */
	PARTIALLY_FULFILLED = 'partially_fulfilled',
	/**
	 * The order's items are fulfilled.
	 */
	FULFILLED = 'fulfilled',
	/**
	 * Some of the order's items, but not all, are shipped.
	 */
	PARTIALLY_SHIPPED = 'partially_shipped',
	/**
	 * The order's items are shipped.
	 */
	SHIPPED = 'shipped',
	/**
	 * Some of the order's items, but not all, are returned.
	 */
	PARTIALLY_RETURNED = 'partially_returned',
	/**
	 * The order's items are returned.
	 */
	RETURNED = 'returned',
	/**
	 * The order's fulfillments are canceled.
	 */
	CANCELED = 'canceled',
	/**
	 * The order's fulfillment requires action.
	 */
	REQUIRES_ACTION = 'requires_action',

	EXPORTED = 'exported',
}

export interface LineItemReq {
	variantId: string;
	quantity: number;
	unit_price?: number;
	title?: string;
}
