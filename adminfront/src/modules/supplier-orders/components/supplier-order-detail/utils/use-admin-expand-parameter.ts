import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';

const orderRelations = [
	'customer',
	'billing_address',
	'shipping_address',
	'discounts',
	'discounts.rule',
	'shipping_methods',
	'shipping_methods.shipping_option',
	'payments',
	'items',
	'fulfillments',
	'fulfillments.tracking_links',
	'returns',
	'returns.shipping_method',
	'returns.shipping_method.shipping_option',
	'returns.shipping_method.tax_lines',
	'refunds',
	'claims.claim_items.item',
	'claims.fulfillments',
	'claims.return_order',
	'claims.additional_items.variant.product.profiles',
	'swaps.return_order',
	'swaps.additional_items.variant.product.profiles',
	'swaps.fulfillments',
	'returnable_items',
	'region'
];

/**
 * Returns an object containing the expanded order relations based on the current feature flags.
 *
 * @return {{ orderRelations: string }} An object with the property `orderRelations` containing a comma-separated string of the expanded order relations.
 */
const useOrdersExpandParam = () => {
	const { isFeatureEnabled } = useFeatureFlag();
	const editsEnabled = isFeatureEnabled('order_editing');

	if (editsEnabled) {
		if (orderRelations.indexOf('edits') === -1) {
			orderRelations.push('edits');
		}
	}

	return {
		orderRelations: orderRelations.join(','),
	};
};

export default useOrdersExpandParam;
