export type DetailFormType = {
	type: {
		value: 'sale' | 'override';
	};
	general: {
		name: string;
		description: string;
		tax_inclusive: boolean;
	};
	dates?: {
		starts_at: string;
		ends_at: string;
	};
	customer_groups?: {
		ids: string[];
	};
};

export type CreatePricingType = {
	detail: DetailFormType;
};

export type CreatePricingList = {
	name: string;
	description: string;
	type: 'sale' | 'override' | undefined;
	customer_groups?: { id: string }[];
	status?: 'draft' | 'active';
	starts_at?: Date | undefined;
	ends_at?: Date | undefined;
	prices?: PricePayload[];
};

export type PricePayload = {
	id?: string;
	amount: number;
	currency_code?: string;
	region_id?: string;
	variant_id: string;
};
