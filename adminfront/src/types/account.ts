
export interface IAdminAuth {
	email: string;
	password: string;
}

export interface IAdminResponse {
	id: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	role: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	api_token: string | null;
	metadata: JSON | null;
	permissions?: any;
	phone: string;
}

export enum ERole {
	ADMIN = 'admin',
	MEMBER = 'member',
}

export enum EPermissions {
	Manager = 'manager',
	Warehouse = 'Warehouse',
	Driver = 'driver',
	Accountant = 'accountant',
}

// Quản lý, Nhân viên kho, Tài xế, Kế toán
export const rolesEmployee = Object.freeze([
	{ label: 'Quản lý', value: EPermissions.Manager },
	{ label: 'Nhân viên kho', value: EPermissions.Warehouse },
	{ label: 'Tài xế', value: EPermissions.Driver },
	{ label: 'Kế toán', value: EPermissions.Accountant },
]);

export type IUserRequest = {
	email: string;
	fullName: string;
	phone: string;
	permissions: string[];
};
