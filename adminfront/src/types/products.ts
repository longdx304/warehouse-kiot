import { ProductVariant as MedusaProductVariant } from '@medusajs/medusa';

export interface IProductResponse {
	id: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	title: string;
	sizes?: string[];
	variants: IProductVariant[];
	options: IProductOptions[];
	color: string;
	quantity: number;
	price: number;
	inventoryQuantity: number;
	metadata: JSON | null;
	categories?: IProductCategory[];
}

export interface IProductCategory {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	description: string;
	handle: string;
	is_active: boolean;
	is_internal: boolean;
	parent_category_id: string | null;
	rank: number;
	metadata: any | null;
	category_children: IProductCategory[];
	parent_category: IProductCategory | null;
}

export interface IProductVariant {
	id: string;
	title: string;
	prices: { amount: number; currency_code: string }[];
	inventory_quantity: number;
	options: {
		[x: string]: string;
		value: string;
	}[];
}

export interface IProductOptions {
	id: string;
	title: string;
	values: { value: string; variant_id: string }[];
}

export interface IProductRequest {
	title: string;
	categories: IProductCategory[];
	sizes: string[];
	color: string;
	quantity: number;
	price: number;
	inventoryQuantity: number;
	variants?: IProductVariant[];
	options?: IProductOptions[];
}

export type GeneralFormType = {
	title: string;
	subtitle?: string | null;
	handle?: string;
	material?: string | null;
	description?: string | null;
	discounted: boolean;
};

export type Option = {
	value: string;
	label: string;
};

export type OrganizeFormType = {
	type?: Option | null;
	collection?: Option | null;
	tags?: string[] | null;
	categories?: string[] | null;
};

export type OptionsFormType = {
	title: string;
	values: string[];
};
export type VariantFormType = {
	title: string;
	options: { value: string; option_id?: string }[];
	manage_inventory?: boolean;
	allow_backorder?: boolean;
	sku?: string;
	inventory_quantity?: number;
	ean?: string;
	upc?: string;
	barcode?: string;
	width?: number;
	length?: number;
	height?: number;
	weight?: number;
	mid_code?: string;
	hs_code?: string;
	origin_country?: string;
	supplier_price?: number;
	cogs_price?: number;
	prices?: {
		amount?: number;
		currency_code?: string;
	}[];
};

export type DimensionsFormType = {
	length?: number | null;
	width?: number | null;
	height?: number | null;
	weight?: number | null;
};

export type CustomsFormType = {
	mid_code?: string | null;
	hs_code?: string | null;
	origin_country?: Option | null;
};

export type FormImage = {
	id: string;
	url: string;
	name?: string;
	size?: number;
	nativeFile?: File;
	selected?: boolean;
};

export type ThumbnailFormType = FormImage[];

export type MediaFormType = FormImage[];

export type NewProductForm = {
	general: GeneralFormType;
	organize: OrganizeFormType;
	options: OptionsFormType[];
	variants: VariantFormType[];
	defaultPrice?: {
		amount?: number;
		supplier_price?: number;
		currency_code?: string;
	};
	dimensions: DimensionsFormType;
	customs: CustomsFormType;
	thumbnail: ThumbnailFormType;
	media: MediaFormType;
};

export enum ProductStatus {
	DRAFT = 'draft',
	PROPOSED = 'proposed',
	PUBLISHED = 'published',
	REJECTED = 'rejected',
}

export type ProductVariant = MedusaProductVariant & {
	supplier_price: number;
	cogs_price: number;
};
