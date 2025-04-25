import { LineItem as MedusaLineItem } from '@medusajs/medusa';

export interface LineItem extends MedusaLineItem {
	warehouse_quantity: number;
}
