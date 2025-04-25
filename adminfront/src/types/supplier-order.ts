import { Payment, Refund, Region, User } from '@medusajs/medusa';
import { Cart } from 'medusa-react';
import { FulfillSupplierOrderStt, Supplier, SupplierOrderDocument } from './supplier';

export interface SupplierOrder {
	id: string;
	cart_id: string;
	cart: Cart;
	display_id: number;
	display_name?: string;
	supplier_id: string;
	supplier: Supplier;
	documents: SupplierOrderDocument[];
	user_id: string;
	currency_code: string;
	region_id: string;
	region?: Region;
	user: User;
	status: string;
	payment_status: string;
	payments: Payment[];
	fulfillment_status: FulfillSupplierOrderStt;
	estimated_production_time: string;
	settlement_time: string;
	shipping_started_date?: string | Date;
	warehouse_entry_date?: string | Date;
	completed_payment_date?: string | Date;
	items: LineItem[];
	tax_rate: number;
	metadata: Record<string, any>;
	subtotal: number;
	total: number;
	tax_total: number;
	paid_total: number;
	refunded_total: number;
	refunds: Refund[];
	no_notification?: boolean;
	created_at: string | Date;
	updated_at: string | Date;
	canceled_at?: string | null;
	delivered_at?: string | Date;
	inventoried_at?: string | Date;
	rejected_at?: string | Date;
	handler_id?: string;
	handler?: User;
}

export type LineItem = {
	variantId: string;
	quantity: number;
	unit_price?: number;
};

export type CreateSupplierOrderInput = {
	lineItems: LineItem[];
	supplierId: string;
	userId: string;
	email: string;
	countryCode: string;
	region_id: string;
	currency_code: string;
	estimated_production_time: Date;
	settlement_time: Date;
	shipping_started_date: Date;
	warehouse_entry_date: Date;
	completed_payment_date: Date;
	document_url: string;
	metadata?: Record<string, unknown>;
};

export type UpdateSupplierOrder = Partial<SupplierOrder> & {};

export type DeleteSupplierOrderLineItem = {
  supplierOrderId: string;
	lineItemId: string;
};

export type CreateSupplierOrderDocument = {
	documents: string | string[];
}