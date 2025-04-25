import {
	Fulfillment as MedusaFulfillment,
	PaginatedResponse,
	User,
} from '@medusajs/medusa';
import { DateComparisonOperator } from './common';

export class AdminListFulfillmentsSelector {
	q?: string;

	id?: string;

	order_id?: string;

	checker_id?: string;

	status?: string;

	shipped_id?: string;

	canceled_at?: DateComparisonOperator;

	shipped_at?: DateComparisonOperator;

	checked_at?: DateComparisonOperator;

	/**
	 * Date filters to apply on the orders' `created_at` date.
	 */
	created_at?: DateComparisonOperator;

	/**
	 * Date filters to apply on the orders' `updated_at` date.
	 */
	updated_at?: DateComparisonOperator;
}

export class AdminGetFulfillmentsParams extends AdminListFulfillmentsSelector {
	/**
	 * {@inheritDoc FindPaginationParams.offset}
	 * @defaultValue 0
	 */
	offset = 0;

	/**
	 * {@inheritDoc FindPaginationParams.limit}
	 * @defaultValue 50
	 */
	limit = 50;

	/**
	 * {@inheritDoc FindParams.expand}
	 */
	expand?: string;

	/**
	 * {@inheritDoc FindParams.fields}
	 */
	fields?: string;

	/**
	 * The field to sort retrieved orders by. By default, the sort order is ascending.
	 * To change the order to descending, prefix the field name with `-`.
	 */
	order?: string;

	isMyOrder?: boolean;
}

export enum FulfullmentStatus {
	AWAITING = 'awaiting',
	DELIVERING = 'delivering',
	SHIPPED = 'shipped',
	CANCELED = 'canceled',
}

export type Fulfillment = MedusaFulfillment & {
	shipped_id: string | null;
	shipper: User | null;
	checker: User | null;

	checker_id: string | null;

	checked_at: Date | null;

	checker_url: string | null;

	shipped_url: string | null;

	status: FulfullmentStatus;
};

export type AdminFulfillmentsListRes = PaginatedResponse & {
	fulfillments: Fulfillment[];
};

export type AdminUpdateFulfillment = Partial<Fulfillment>;

export type AdminAssignShipment = {
	fulfillment_id: string;
	status: FulfullmentStatus;
};

export enum FulfillmentStatus {
	/**
	 * The order's items are not fulfilled.
	 */
	NOT_FULFILLED = "not_fulfilled",
	/**
	 * Some of the order's items, but not all, are fulfilled.
	 */
	PARTIALLY_FULFILLED = "partially_fulfilled",
	/**
	 * The order's items are fulfilled.
	 */
	FULFILLED = "fulfilled",
	/**
	 * Some of the order's items, but not all, are shipped.
	 */
	PARTIALLY_SHIPPED = "partially_shipped",
	/**
	 * The order's items are shipped.
	 */
	SHIPPED = "shipped",
	/**
	 * Some of the order's items, but not all, are returned.
	 */
	PARTIALLY_RETURNED = "partially_returned",
	/**
	 * The order's items are returned.
	 */
	RETURNED = "returned",
	/**
	 * The order's fulfillments are canceled.
	 */
	CANCELED = "canceled",
	/**
	 * The order's fulfillment requires action.
	 */
	REQUIRES_ACTION = "requires_action",

	EXPORTED = 'exported'
}