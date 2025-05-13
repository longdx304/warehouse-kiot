import type { MenuProps } from 'antd';
import { Menu, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { deleteCookie } from '@/actions/auth';
import { ERoutes } from '@/types/routes';	
import { menuItems, menuRoutes } from './MenuItem';
import { useLogout } from '@/lib/hooks/api/auth';
import { User } from '@/types/auth';

interface Props {
	user: User;
	className?: string;
	remove: () => void;
	onClose?: () => void;
}

const Menubar = ({ user, remove, className, onClose = () => {} }: Props) => {
	const router = useRouter();
	const [messageApi, contextHolder] = message.useMessage();
	const { mutateAsync: logout } = useLogout();

	// Handle user click menu items
	const handleClickMenu: MenuProps['onClick'] = (e) => {
		const { key } = e;
		if (menuRoutes[key]) {
			router.push(menuRoutes[key]);
			onClose();
			return;
		}
	};

	const logOut = async () => {
		logout(undefined, {
			onSuccess: async () => {
				remove();
				await deleteCookie();
				router.push(ERoutes.LOGIN);
			},
			onError: (err) => {
				message.error('Đăng xuất thất bại!');
			},
		});
	};

	// Handle user click dropdown
	const handleDropdownClick = (e: any) => {
		const { key } = e;
		if (key === 'logout') {
			logOut();
		}
	};

	// Render items menu
	const _menuItems = useMemo(
		() => menuItems(user, handleDropdownClick),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[user]
	);

	return (
		<Menu
			className={className}
			onClick={handleClickMenu}
			mode="inline"
			items={_menuItems as any}
		/>
	);
};

export default Menubar;
