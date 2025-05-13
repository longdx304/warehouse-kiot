'use client';
import { FC, MouseEvent } from 'react';
import Image from 'next/image';
import { Flex, Drawer, Menu } from 'antd';

import { Button } from '@/components/Button';
import Menubar from './Menubar';
import { User } from '@/types/auth';
import { useLogout } from '@/lib/hooks/api/auth';

interface Props {
	state: boolean;
	onOpen: () => void;
	onClose: () => void;
	user: User;
}

const DrawerMenu = ({ state, onOpen, onClose, user }: Props) => {
	const { mutateAsync: logout } = useLogout();
	return (
		<Drawer
			className="[&_.ant-drawer-title]:flex [&_.ant-drawer-title]:justify-center [&_.ant-drawer-title]:items-center [&_.ant-drawer-body]:!px-0"
			width={220}
			title={
				<Image
					src="/images/dob-icon.png"
					width={33}
					height={48}
					alt="Dob Icon"
				/>
			}
			closeIcon={null}
			onClose={() => onClose()}
			open={state}
		>
			<Menubar user={user} onClose={onClose} remove={() => logout(undefined, {
				onSuccess: () => {
					onClose();
				},
			})} />
		</Drawer>
	);
};

export default DrawerMenu;
