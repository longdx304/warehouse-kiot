// @ts-nocheck
// !check this file
import { ClaimItem, LineItem, Order } from '@medusajs/medusa';

/**
 * Returns all returnable items from an order or a claim.
 * If the order has claims with return orders that are not canceled,
 * the claimed items are subtracted from the order items.
 *
 * @param {Omit<Order, 'beforeInserts'>} order - The order or claim.
 * @param {boolean} isClaim - Whether the order is a claim.
 * @returns {Omit<LineItem, 'beforeInsert'>[]} - The returnable items.
 */
export const getAllReturnableItems = (
	order: Omit<Order, 'beforeInserts'>,
	isClaim: boolean
): Omit<LineItem, 'beforeInsert'>[] => {
	// Initialize the map of order items and claimed items
	let orderItems = order.items.reduce(
		(map, obj) => map.set(obj.id, { ...obj }),

		new Map<string, Omit<LineItem, 'beforeInsert'>>()
	);

	let claimedItems: ClaimItem[] = [];

	// Process claims
	if (order?.claims?.length) {
		for (const claim of order.claims) {
			// Skip claims with canceled return orders
			if (claim.return_order?.status !== 'canceled') {
				claim.claim_items = claim.claim_items ?? [];
				claimedItems = [...claimedItems, ...claim.claim_items];
			}

			// Skip claims with not fulfilled fulfillment status or payment status 'na'
			if (
				claim.fulfillment_status === 'not_fulfilled' &&
				claim.payment_status === 'na'
			) {
				continue;
			}

			// Add additional items to the order items map
			if (claim?.additional_items?.length) {
				orderItems = claim.additional_items
					.filter(
						(it: any) =>
							it.shipped_quantity ||
							it.shipped_quantity === it.fulfilled_quantity
					)
					.reduce(
						(map: any, obj: any) => map.set(obj.id, { ...obj }),
						orderItems
					);
			}
		}
	}

	// Process swaps for non-claim orders
	if (!isClaim) {
		if (order?.swaps?.length) {
			for (const swap of order.swaps) {
				// Skip swaps with not fulfilled fulfillment status
				if (swap.fulfillment_status === 'not_fulfilled') {
					continue;
				}

				// Add additional items to the order items map
				orderItems = swap.additional_items.reduce(
					(map: any, obj: any) =>
						map.set(obj.id, {
							...obj,
						}),
					orderItems
				);
			}
		}
	}

	// Subtract claimed items from order items
	for (const item of claimedItems) {
		const i = orderItems.get(item.item_id);
		if (i) {
			i.quantity = i.quantity - item.quantity;
			i.quantity !== 0 ? orderItems.set(i.id, i) : orderItems.delete(i.id);
		}
	}

	// Return the returnable items
	return [...orderItems.values()];
};
