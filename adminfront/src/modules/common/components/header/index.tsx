'use client';
import { User } from '@medusajs/medusa';
import { Badge, Skeleton } from 'antd';
import { Bell, Menu, RotateCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, Fragment } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Dropdown } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import useToggleState from '@/lib/hooks/use-toggle-state';
import useScrollDirection from '@/lib/hooks/useScrollDirection';
import { useUser } from '@/lib/providers/user-provider';
import { cn } from '@/lib/utils';
import { ERoutes } from '@/types/routes';
import DropdownRender from '../notification/Dropdown';
import DrawerMenu from './DrawerMenu';
import Menubar from './Menubar';
import { useRouter } from 'next/navigation';

interface Props {}

const Header: FC<Props> = ({}) => {
	const router = useRouter();
	const { state, onClose, onOpen } = useToggleState(false);
	const scrollDirection = useScrollDirection();
	const { user, isLoading, remove } = useUser();

	return (
		<Card
			className={cn(
				'fixed top-0 w-full p-0 [&_.ant-card-body]:py-2 transition-all ease-in-out duration-300 z-[999]',
				'lg:w-[200px] lg:h-full lg:[&_.ant-card-body]:px-0',
				scrollDirection === 'up'
					? 'max-lg:translate-y-0'
					: 'max-lg:-translate-y-14'
			)}
			bordered={false}
		>
			{isLoading && (
				<Fragment>
					<div className="w-full lg:hidden">
						<Skeleton.Input active block />
					</div>
					<div className="hidden lg:flex px-4 flex-col items-center gap-2">
						<Skeleton.Image active />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
						<Skeleton.Input active block />
					</div>
				</Fragment>
			)}
			{!isLoading && (
				<Fragment>
					<Flex
						className="lg:justify-center"
						justify="space-between"
						align="center"
					>
						<Link href={ERoutes.DASHBOARD} className="flex items-center">
							<Image
								src="/images/dob-icon.png"
								width={28}
								height={37}
								alt="Dob Icon"
							/>
						</Link>
						{/* Mobile: Button Menu */}
						<Flex>
							<Button
								icon={<RotateCw size={20} />}
								shape="circle"
								type="text"
								onClick={() => router.refresh()}
								className="lg:hidden"
							/>
							<Dropdown
								dropdownRender={(menu) => DropdownRender()}
								trigger={['click']}
								overlayStyle={{
									backgroundColor: 'transparent',
									width: '300px',
									height: 'calc(100% - 60px)',
								}}
								arrow={{ pointAtCenter: true }}
								className="block lg:hidden"
							>
								<a onClick={(e) => e.preventDefault()} className="">
									<Button type="text" shape="circle">
										<Badge dot>
											<Bell color="black" size={20} />
										</Badge>
									</Button>
								</a>
							</Dropdown>
							<Button
								icon={<Menu />}
								shape="circle"
								type="text"
								onClick={() => onOpen()}
								className="lg:hidden"
							/>
						</Flex>
					</Flex>
					{/* Desktop: Content Menu */}
					<div className="hidden lg:block h-[calc(100vh-100px)] overflow-y-auto">
						<Menubar
							user={user as Omit<User, 'password_hash'>}
							remove={remove}
							className="pr-2"
						/>
					</div>
					{/* Mobile: Drawer menu */}
					<DrawerMenu
						state={state}
						onOpen={onOpen}
						onClose={onClose}
						user={user as Omit<User, 'password_hash'>}
					/>
				</Fragment>
			)}
		</Card>
	);
};

export default Header;
