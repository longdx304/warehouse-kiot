import { MetadataFormType } from '@/types/common';
import { Option } from '@/types/shared';
import fulfillmentProvidersMapper from '@/utils/fulfillment-providers.mapper';
import {
	AdminPostShippingOptionsReq,
	ShippingOptionPriceType,
} from '@medusajs/medusa';
import {
	useAdminRegionFulfillmentOptions,
	useAdminShippingProfiles,
} from 'medusa-react';
import { useMemo } from 'react';

type OptionType = {
	id: string;
	name?: string;
	is_return?: boolean;
};

type Requirement = {
	amount: number | null;
	id: string | null;
};

export type ShippingOptionFormType = {
	store_option: boolean;
	name: string | null;
	price_type: ShippingOptionPriceType | null;
	amount: number | null;
	shipping_profile: Option | null;
	fulfillment_provider: Option | null;
	requirements: {
		min_subtotal: Requirement | null;
		max_subtotal: Requirement | null;
	};
	metadata: MetadataFormType;
};

export const useShippingOptionFormData = (
	regionId: string,
	isReturn = false
) => {
	const { shipping_profiles } = useAdminShippingProfiles();
	const { fulfillment_options } = useAdminRegionFulfillmentOptions(regionId);

	const fulfillmentOptions: Option[] = useMemo(() => {
		if (!fulfillment_options) {
			return [];
		}

		const options = fulfillment_options.reduce((acc, current, index) => {
			const opts = current.options as OptionType[];

			const filtered = opts.filter((o) => !!o.is_return === !!isReturn);

			return acc.concat(
				filtered.map((option, o) => ({
					label: `${option.name || option.id} via ${
						fulfillmentProvidersMapper(current.provider_id).label
					}`,
					value: `${index}.${o}`,
				}))
			);
		}, [] as Option[]);

		return options;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fulfillment_options]);

	const shippingProfileOptions = useMemo(() => {
		return (
			shipping_profiles?.map((profile) => ({
				value: profile.id,
				label: profile.name,
			})) || []
		);
	}, [shipping_profiles]);

	const getFulfillmentData = (value: string) => {
		const fOptions = fulfillment_options?.map((provider) => {
			const options = provider.options as OptionType[];

			const filtered = options.filter((o) => !!o.is_return === !!isReturn);

			return {
				...provider,
				options: filtered,
			};
		});

		const [providerIndex, optionIndex] = value.split('.');
		const { provider_id, options } = fOptions?.[providerIndex as any] || {};

		return { provider_id, data: options?.[optionIndex as any] || {} } as {
			provider_id: string;
			data: Record<string, unknown>;
		};
	};

	const getRequirementsData = (data: ShippingOptionFormType) => {
		if (Array.isArray(data.requirements)) {
			return data.requirements;
		}
		const requirements = Object.entries(data.requirements).reduce(
			(acc, [key, value]) => {
				if (typeof value?.amount === 'number' && value.amount >= 0) {
					acc.push({
						type: key,
						amount: value.amount,
						id: value.id || undefined,
					});
					return acc;
				} else {
					return acc;
				}
			},
			[] as { type: string; amount: number; id?: string }[]
		);

		return requirements;
	};

	const getShippingOptionData = (
		data: ShippingOptionFormType,
		regionId: string,
		isReturn = false
	) => {
		const { provider_id, data: fData } = getFulfillmentData(
			data.fulfillment_provider!.value
		);

		const payload: AdminPostShippingOptionsReq = {
			is_return: false,
			region_id: regionId,
			profile_id: data.shipping_profile?.value,
			name: data.name!,
			data: fData,
			price_type: data.price_type as ShippingOptionPriceType,
			provider_id,
			admin_only: !data.store_option,
			amount: data.amount!,
			requirements: getRequirementsData(data) as any,
		};

		if (isReturn) {
			payload.is_return = true;
			payload.price_type = 'flat_rate' as any;
		}

		return { payload };
	};

	return {
		shippingProfileOptions,
		fulfillmentOptions,
		getFulfillmentData,
		getRequirementsData,
		getShippingOptionData,
	};
};
