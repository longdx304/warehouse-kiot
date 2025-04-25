import { PaginatedResponse } from "@medusajs/medusa";
import { ProductVariant } from "./products";

export type AdminVariantListRes = PaginatedResponse & {
	variants: ProductVariant[];
};
