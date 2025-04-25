export interface ItemUnit {
	id: string;
	unit: string;
	quantity: number;
}

export interface AdminItemUnitRes {
	item_unit: ItemUnit;
}

export interface AdminPostItemUnitReq {
	unit?: string;
	quantity?: number;
}

export type AdminItemUnitDeleteRes = {
	id: string;
	object: string;
	deleted: boolean;
};

export type AdminItemUnitListRes = {
	item_units: ItemUnit[];
};

export type AdminGetItemUnitParams = {};
