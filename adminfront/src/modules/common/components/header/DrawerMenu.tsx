'use client';
import { FC, MouseEvent } from 'react';
import Image from 'next/image';
import { Flex, Drawer, Menu } from 'antd';

import { Button } from '@/components/Button';
import { IAdminResponse } from '@/types/account';
import Menubar from './Menubar';
import { User } from '@medusajs/medusa';
import { useAdminGetSession } from 'medusa-react';

interface Props {
	state: boolean;
	onOpen: () => void;
	onClose: () => void;
	user: Omit<User, 'password_hash'>;
}

const DrawerMenu = ({ state, onOpen, onClose, user }: Props) => {
	const { remove } = useAdminGetSession();
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
			<Menubar user={user} onClose={onClose} remove={remove} />
		</Drawer>
	);
};

export default DrawerMenu;
