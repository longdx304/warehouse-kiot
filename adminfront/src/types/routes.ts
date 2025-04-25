import { EPermissions } from './account';

export enum ERoutes {
	LOGIN = '/login',
	HOME = '/admin',
	ACCOUNTS = '/admin/accounts',
	PRODUCTS = '/admin/products',
	DASHBOARD = '/admin/dashboard',
	PRODUCT_CATEGORIES = '/admin/product-categories',
	PRICING = '/admin/pricing',
	CUSTOMERS = '/admin/customers',
	REGIONS = '/admin/regions',
	ORDERS = '/admin/orders',
	DRAFT_ORDERS = '/admin/draft-orders',
	RETURN_REASONS = '/admin/return-reasons',
	DISCOUNTS = '/admin/discounts',
	SUPPLIERS = '/admin/suppliers',
	SUPPLIER_ORDERS = '/admin/supplier-orders',
	GIFT_CARDS = '/admin/gift-cards',
	CURRENCIES = '/admin/currencies',
	WAREHOUSE_INBOUND = '/admin/warehouse/inbound',
	WAREHOUSE_OUTBOUND = '/admin/warehouse/outbound',
	WAREHOUSE_TRANSACTIONS = '/admin/warehouse/transactions',
	ITEM_UNIT = '/admin/item-unit',
	WAREHOUSE_STOCK_CHECKER = '/admin/warehouse/stock-checker',
	WAREHOUSE_SHIPMENT = '/admin/warehouse/shipment',
	WAREHOUSE_MANAGE = '/admin/warehouse/manage',
	WAREHOUSE_INVENTORY_CHECKER = '/admin/warehouse/inventory-checker',
}

export interface TRouteConfig {
	path: ERoutes;
	mode: EPermissions[];
}

export const routesConfig: TRouteConfig[] = [
	{
		path: ERoutes.LOGIN,
		mode: [],
	},
	{
		path: ERoutes.ACCOUNTS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.PRODUCTS,
		mode: [
			EPermissions.Manager,
			EPermissions.Driver,
			EPermissions.Accountant,
			EPermissions.Warehouse,
		],
	},
	{
		path: ERoutes.DASHBOARD,
		mode: [
			EPermissions.Manager,
			EPermissions.Driver,
			EPermissions.Accountant,
			EPermissions.Warehouse,
		],
	},
	{
		path: ERoutes.PRODUCT_CATEGORIES,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.PRICING,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.CUSTOMERS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.REGIONS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.ORDERS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.RETURN_REASONS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.DISCOUNTS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.GIFT_CARDS,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.SUPPLIERS,
		mode: [EPermissions.Manager, EPermissions.Accountant],
	},
	{
		path: ERoutes.SUPPLIER_ORDERS,
		mode: [EPermissions.Manager, EPermissions.Accountant],
	},
	{
		path: ERoutes.CURRENCIES,
		mode: [EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_INBOUND,
		mode: [EPermissions.Warehouse, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_OUTBOUND,
		mode: [EPermissions.Warehouse, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_TRANSACTIONS,
		mode: [EPermissions.Warehouse, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_STOCK_CHECKER,
		mode: [EPermissions.Warehouse, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_SHIPMENT,
		mode: [EPermissions.Driver, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_MANAGE,
		mode: [EPermissions.Driver, EPermissions.Manager],
	},
	{
		path: ERoutes.WAREHOUSE_INVENTORY_CHECKER,
		mode: [EPermissions.Driver, EPermissions.Manager],
	},
];
