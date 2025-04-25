// @ts-nocheck
// !check this file
import {
	AddressPayload,
	ClaimTypeFormType,
	CreateClaimFormType,
	ItemsToReceiveFormType,
	ItemsToReturnFormType,
	ItemsToSendFormType,
	ReceiveReturnFormType,
	SendNotificationFormType,
	ShippingFormType,
} from '@/types/order';
import { Subset } from '@/types/shared';
import { isoAlpha2Countries } from '@/utils/countries';
import { ClaimItem, LineItem, Order, Return } from '@medusajs/medusa';

/**
 * Returns the default shipping address values for an order.
 *
 * @param {Order} order - The order object.
 * @return {Subset<AddressPayload>} - The default shipping address values.
 */
const getDefaultShippingAddressValues = (
	order: Order
): Subset<AddressPayload> => {
	if (!order.shipping_address) {
		return {
			address_1: undefined,
			address_2: undefined,
			city: undefined,
			company: undefined,
			country_code: undefined,
			first_name: undefined,
			last_name: undefined,
			phone: undefined,
			postal_code: undefined,
			province: undefined,
		};
	}

	const keys = Object.keys(order.shipping_address).map(
		(k) => k
	) as (keyof AddressPayload)[];

	/**
	 * Returns the default shipping address values for an order.
	 * If the country code exists in the shipping address, it also includes the country display name.
	 *
	 * @param {Order} order - The order object.
	 * @return {Subset<AddressPayload>} - The default shipping address values.
	 */
	return keys.reduce<Partial<AddressPayload>>((acc, key) => {
		if (key === 'country_code') {
			const countryDisplayName = order.shipping_address.country_code
				? isoAlpha2Countries[order.shipping_address.country_code.toUpperCase()]
				: '';
			acc[key] = {
				value: order?.shipping_address?.[key] ?? '',
				label: countryDisplayName,
			};
		} else {
			acc[key] = order.shipping_address[key] || undefined;
		}
		return acc;
	}, {});
};

/**
 * Returns all returnable items from an order or a claim.
 * If the order has claims with return orders that are not canceled,
 * the claimed items are subtracted from the order items.
 *
 * @param {Omit<Order, 'beforeInserts'>} order - The order or claim.
 * @param {boolean} isClaim - Whether the order is a claim.
 * @return {Omit<LineItem, 'beforeInsert'>[]} - The returnable items.
 */
export const getAllReturnableItems = (
	order: Omit<Order, 'beforeInserts'>,
	isClaim: boolean
) => {
	let orderItems = order.items.reduce(
		(map, obj) => map.set(obj.id, { ...obj }),

		new Map<string, Omit<LineItem, 'beforeInsert'>>()
	);

	let claimedItems: ClaimItem[] = [];

	if (order?.claims?.length) {
		for (const claim of order.claims) {
			claim.claim_items = claim.claim_items ?? [];
			claimedItems = [...claimedItems, ...claim.claim_items];

			if (
				claim.fulfillment_status === 'not_fulfilled' &&
				claim.payment_status === 'na'
			) {
				continue;
			}

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

	if (!isClaim) {
		if (order?.swaps?.length) {
			for (const swap of order.swaps) {
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

	for (const item of claimedItems) {
		const i = orderItems.get(item.item_id);

		if (i) {
			i.quantity = i.quantity - (item.item.returned_quantity || 0);
			i.quantity !== 0 ? orderItems.set(i.id, i) : orderItems.delete(i.id);
		}
	}

	return [...orderItems.values()];
};

const getDefaultSendNotificationValues = (): SendNotificationFormType => {
	return {
		send_notification: true,
	};
};

const getDefaultAdditionalItemsValues = (): ItemsToSendFormType => {
	return {
		items: [],
	};
};

const getDefaultClaimTypeValues = (): ClaimTypeFormType => {
	return {
		type: 'refund',
	};
};

const getDefaultShippingValues = (): Subset<ShippingFormType> => {
	return {
		option: undefined,
		price: undefined,
	};
};

/**
 * Returns an object containing items that can be returned for a given order.
 *
 * @param {Order} order - The order object from which to extract returnable items.
 * @return {ItemsToReturnFormType} An object containing an array of items that can be returned.
 */
const getReturnableItemsValues = (order: Order) => {
	const returnItems: ItemsToReturnFormType = {
		items: [],
	};

	if (!order.returnable_items?.length) {
		return returnItems;
	}

	order.returnable_items.forEach((item) => {
		const returnableQuantity = item.quantity - (item.returned_quantity || 0);

		returnItems.items.push({
			item_id: item.id,
			thumbnail: item.thumbnail,
			refundable: item.refundable || 0,
			product_title: item.variant.product.title,
			sku: item.variant.sku,
			variant_title: item.variant.title,
			quantity: returnableQuantity,
			original_quantity: item.quantity,
			total: item.total || 0,
			return_reason_details: {
				note: undefined,
				reason: undefined,
			},
			return: false,
		});
	});

	return returnItems;
};

/**
 * Returns an object containing items that can be received for a given order and return request.
 *
 * @param {Order} order - The order object from which to extract returnable items.
 * @param {Return} returnRequest - The return request object containing items to be received.
 * @return {Subset<ItemsToReceiveFormType>} An object containing an array of items that can be received.
 */
const getReceiveableItemsValues = (
	order: Order,
	returnRequest: Return
): Subset<ItemsToReceiveFormType> => {
	const returnableItems = getReturnableItemsValues(order);

	const returnItems = {
		items: returnableItems?.items?.reduce((acc, item) => {
			if (!item) {
				return acc;
			}

			const indexOfRequestedItem = returnRequest.items.findIndex(
				(i) => i.item_id === item.item_id
			);

			if (item.item_id && indexOfRequestedItem > -1) {
				const requestedItem = returnRequest.items[indexOfRequestedItem];

				const adjustedQuantity =
					requestedItem.requested_quantity - requestedItem.received_quantity;

				/**
				 * We need to know the paid price per item, so we can display
				 * the correct expcted refund amount. This requires us to
				 * find the original quantity on the order line items,
				 * as any previous returns will have adjusted the quantity.
				 */
				const price = (item.total || 0) / item.original_quantity;

				acc.push({
					...item,
					price,
					quantity: adjustedQuantity,
					original_quantity: adjustedQuantity,
				});
			}
			return acc;
		}, [] as Subset<ItemsToReceiveFormType['items']>),
	};

	return returnItems;
};

export const getDefaultReceiveReturnValues = (
	order: Order,
	returnRequest: Return
): Subset<ReceiveReturnFormType> => {
	return {
		receive_items: getReceiveableItemsValues(order, returnRequest),
	};
};

/**
 * Returns the default values for a claim form based on the provided order.
 *
 * @param {Order} order - The order object.
 * @return {Subset<CreateClaimFormType>} - The default values for the claim form.
 */
export const getDefaultClaimValues = (
	order: Order
): Subset<CreateClaimFormType> => {
	return {
		claim_type: getDefaultClaimTypeValues(),
		additional_items: getDefaultAdditionalItemsValues(),
		notification: getDefaultSendNotificationValues(),
		return_items: getReturnableItemsValues(order),
		shipping_address: getDefaultShippingAddressValues(order),
		return_shipping: getDefaultShippingValues(),
		replacement_shipping: getDefaultShippingValues(),
	};
};
