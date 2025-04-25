import { PaginatedResponse, User } from '@medusajs/medusa';
import { ItemUnit } from './item-unit';
import { ProductVariant } from './products';

export interface Warehouse {
	id: string;
	location: string;
	capacity: number;
	created_at: string;
	updated_at: string;
	inventories: WarehouseInventory[];
}

export interface AdminPostWarehouseReq {
	location: string;
	capacity?: number;
}

export interface AdminPostManageWarehouseVariantReq {
	location: string;
	variant_id: string;
	warehouse_id?: string;
	quantity: number;
	unit_id: string;
	type: string;
	note?: string;
}

type AdminPostWarehouseRes = {
	warehouse_id?: string;
	location: string;
	variant_id: string;
	capacity?: number;
	unit_id: string;
};

export type AdminPostItemData = {
	variant_id: string;
	quantity: number;
	unit_id: string;
	line_item_id: string;
	order_id: string;
	type: string;
};

export interface AdminPostWarehouseVariantReq1 {
	warehouse: AdminPostWarehouseRes;
	itemInventory: AdminPostItemData;
}

export interface AdminPostWarehouseVariantReq {
	warehouse_id?: string;
	location: string;
	variant_id: string;
	capacity?: number;
}

export type AdminWarehouseRes = {
	warehouse: Warehouse;
};

export type AdminWarehousesListRes = PaginatedResponse & {
	warehouse: Warehouse[];
};

export type AdminWarehouseDeleteRes = {
	id: string;
	object: string;
	deleted: boolean;
};

export type AdminInventoryRemoveRes = {};

export type WarehouseInventory = {
	id: string;
	warehouse_id: string;
	variant_id: string;
	quantity: number;
	unit_id: string;
	item_unit: ItemUnit;
	variant: ProductVariant;
	warehouse: Warehouse;
	created_at: string;
	updated_at: string;
	user_id: string;
	user: User;
};

export interface AdminPostInboundInventoryReq {
	id?: string;
	warehouse_id?: string;
	variant_id: string;
	quantity: number;
	unit_id: string;
	line_item_id: string;
	order_id?: string;
	type?: string;
	note?: string;
}
export interface AdminPostManageInventoryWarehouseReq {
	id?: string;
	warehouse_id?: string;
	variant_id: string;
	quantity: number;
	unit_id: string;
	note?: string;
}

export interface AdminPostRemmoveInventoryReq {
	unit_id: string;
	line_item_id: string;
	variant_id: string;
	warehouse_inventory_id: string;
	quantity: number;
	order_id?: string;
	warehouse_id: string;
	type: 'INBOUND' | 'OUTBOUND';
}
export interface AdminPostCreateOutboundInventoryReq {
	unit_id: string;
	line_item_id: string;
	variant_id: string;
	warehouse_inventory_id: string;
	quantity: number;
	order_id?: string;
	warehouse_id: string;
	type: 'OUTBOUND';
}

export type AdminWarehouseTransactionsRes = {
	inventoryTransactions: WarehouseInventory[];
	count: number;
};

export enum TransactionType {
	INBOUND = 'INBOUND',
	OUTBOUND = 'OUTBOUND',
}
