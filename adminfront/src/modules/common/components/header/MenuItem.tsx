import type { MenuProps } from 'antd';
import { Flex } from 'antd';
import {
	BadgeDollarSign,
	Boxes,
	Building,
	CircleDollarSign,
	Container,
	Earth,
	Ellipsis,
	Layers,
	LayoutList,
	LogOut,
	NotebookPen,
	Package,
	PackageCheck,
	PackageMinus,
	PackagePlus,
	Settings,
	ShoppingCart,
	SquarePercent,
	Truck,
	Undo2,
	User as UserIcon,
	Users,
	UsersRound,
	Warehouse,
} from 'lucide-react';

import { Dropdown } from '@/components/Dropdown';
import { EPermissions, IAdminResponse } from '@/types/account';
import { ERoutes } from '@/types/routes';
import { User } from '@medusajs/medusa';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';

type MenuItem = Required<MenuProps>['items'][number];
function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: 'group'
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		type,
	} as MenuItem;
}

// Item dropdown user
const itemDropdown: MenuProps['items'] = [
	{
		key: 'logout',
		label: 'Đăng xuất',
		icon: <LogOut />,
	},
];

// Item menu overview
const itemSales = [
	getItem('Đơn hàng', 'orders', <ShoppingCart />),
	getItem('Danh mục', 'product-categories', <LayoutList />),
	getItem('Sản phẩm', 'products', <Layers />),
	getItem('Định giá', 'pricing', <CircleDollarSign />),
	getItem('Khách hàng', 'customers', <UsersRound />),
	getItem('Giảm giá', 'discounts', <SquarePercent />),
].filter(() => true);

const itemPurchases = [
	getItem('Nhà cung cấp', 'suppliers', <Building />),
	getItem('Nhập hàng', 'supplier-orders', <Container />),
].filter(() => true);

// Item menu warehouse
const itemsWarehouse: MenuProps['items'] = [
	getItem('Quản lý kho', 'warehouse-manage', <Warehouse />),

	getItem('Kiểm kho', 'warehouse-inventory-checker', <Package />),
	getItem('Nhập kho', 'warehouse-inbound', <PackagePlus />),
	getItem('Xuất kho', 'warehouse-outbound', <PackageMinus />),
	getItem('Kiểm hàng', 'warehouse-stock-checker', <PackageCheck />),
	getItem('Vận chuyển', 'warehouse-ship', <Truck />),
	getItem('Sổ kho', 'warehouse-transaction', <NotebookPen />),
];

// Item menu option
const itemsAdmin: MenuProps['items'] = [
	getItem('Quản lý nhân viên', 'accounts', <Users />),
	getItem('Cài đặt', 'setting', <Settings />, [
		getItem('Khu vực', 'regions', <Earth />),
		getItem('Đơn vị hàng', 'item-unit', <Boxes />),
		getItem('Tiền tệ', 'currencies', <BadgeDollarSign />),
		getItem('Lý do trả hàng', 'return-reasons', <Undo2 />),
	]),
];

// Item menu user
const itemUser = (
	user: IAdminResponse,
	handleDropdownClick: (e: any) => void
) => [
	getItem(
		<Dropdown
			menu={{ items: itemDropdown, onClick: handleDropdownClick }}
			trigger={['click']}
		>
			<a onClick={(e) => e.preventDefault()}>
				<Flex className="w-full" justify="space-between" align="center">
					<div className="font-bold">
						{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`}
					</div>
					<Ellipsis />
				</Flex>
			</a>
		</Dropdown>,
		'user-1',
		<UserIcon />
	),
];

// Generation menu
export const menuItems = (
	user: Omit<User, 'password_hash'>,
	handleDropdownClick: (e: any) => void
) => {
	const role = user?.role;
	let permissions = (user as any)?.permissions?.split(',');

	if (role === 'admin') {
		permissions = [
			EPermissions.Manager,
			EPermissions.Warehouse,
			EPermissions.Driver,
			EPermissions.Accountant,
		];
	}

	const hasRequiredPermissionsSale = !isEmpty(
		intersection(permissions, [EPermissions.Accountant, EPermissions.Manager])
	);
	// Check if user has required permissions for warehouse
	const hasRequiredPermissionsWarehouse = !isEmpty(
		intersection(permissions, [EPermissions.Manager, EPermissions.Warehouse])
	);
	const hasRequiredPermissionsShip = !isEmpty(
		intersection(permissions, [EPermissions.Manager, EPermissions.Driver])
	);

	return [
		hasRequiredPermissionsSale &&
			getItem('Bán hàng', 'sale', null, itemSales as MenuItem[], 'group'),
		hasRequiredPermissionsSale &&
			getItem(
				'Mua hàng',
				'purchase',
				null,
				itemPurchases as MenuItem[],
				'group'
			),
		hasRequiredPermissionsWarehouse &&
			getItem('Kho', 'inventory', null, itemsWarehouse as MenuItem[], 'group'),
		role === 'admin' &&
			getItem('Admin', 'admin', null, itemsAdmin as MenuItem[], 'group'),
		getItem(
			'',
			'user',
			null,
			itemUser(user as any, handleDropdownClick),
			'group'
		),
	];
};

export const menuRoutes: Record<string, string> = {
	accounts: ERoutes.ACCOUNTS,
	'product-categories': ERoutes.PRODUCT_CATEGORIES,
	products: ERoutes.PRODUCTS,
	pricing: ERoutes.PRICING,
	customers: ERoutes.CUSTOMERS,
	regions: ERoutes.REGIONS,
	orders: ERoutes.ORDERS,
	'return-reasons': ERoutes.RETURN_REASONS,
	discounts: ERoutes.DISCOUNTS,
	suppliers: ERoutes.SUPPLIERS,
	'supplier-orders': ERoutes.SUPPLIER_ORDERS,
	currencies: ERoutes.CURRENCIES,
	'warehouse-inbound': ERoutes.WAREHOUSE_INBOUND,
	'warehouse-outbound': ERoutes.WAREHOUSE_OUTBOUND,
	'warehouse-transaction': ERoutes.WAREHOUSE_TRANSACTIONS,
	'item-unit': ERoutes.ITEM_UNIT,
	'warehouse-stock-checker': ERoutes.WAREHOUSE_STOCK_CHECKER,
	'warehouse-ship': ERoutes.WAREHOUSE_SHIPMENT,
	'warehouse-manage': ERoutes.WAREHOUSE_MANAGE,
	'warehouse-inventory-checker': ERoutes.WAREHOUSE_INVENTORY_CHECKER,
};
