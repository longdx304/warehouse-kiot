'use client';

import React from 'react';
import { ProductCategory } from '@medusajs/medusa';
import {
	Folder,
	Tag,
	Ban,
	EyeOff,
	Plus,
	Ellipsis,
	Trash2,
	Pencil,
} from 'lucide-react';
import type { MenuProps } from 'antd';

import { cn } from '@/lib/utils';
import { TooltipIcon, Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { deleteImages } from '@/actions/images';

type Props = {
	depth: number;
	item: ProductCategory;
	handler: React.ReactNode;
	collapseIcon: React.ReactNode;
	handleCreateSubCategory: (parentCategory: ProductCategory) => void;
	handleEdit: (record: ProductCategory) => void;
	handleDelete: (record: ProductCategory['id']) => void;
};

const CategoryItem = (props: Props) => {
	const { item } = props;

	// Check item has children item
	const hasChildren = !!item.category_children?.length;

	// Item dropdown user
	const itemDropdown: MenuProps['items'] = [
		{
			label: <div className="w-full">Chỉnh sửa</div>,
			key: 'edit',
			icon: <Pencil className="w-[16px]" />,
		},
		{
			label: <div className="w-full text-red-500">Xoá</div>,
			key: 'delete',
			icon: <Trash2 className="text-red-500 w-[16px]" />,
		},
	];

	const handleDeleteFile = async (url: string) => {
		await deleteImages(url);
	};
	// Handle menu click edit or delete
	const handleMenuClick: MenuProps['onClick'] = async (e) => {
		// Case item is edit
		if (e.key === 'edit') {
			props.handleEdit(item);
			return;
		}
		// Case item is delete
		await handleDeleteFile(props.item.metadata.thumbnail as any);
		props.handleDelete(item.id as any);
	};

	return (
		<div className="bg-white">
			<div
				style={{ marginLeft: props.depth * -8 }}
				className="flex h-[40px] items-center"
			>
				<div className="flex w-[32px] items-center justify-center">
					{props.handler}
				</div>

				<div className="flex w-full items-center justify-between">
					<div className="flex items-center">
						{hasChildren && (
							<div
								className="absolute flex w-[20px] cursor-pointer items-center justify-center"
								data-testid="collapseIcon"
							>
								{props.collapseIcon}
							</div>
						)}
						<div className="ml-[20px] flex w-[32px] items-center justify-center">
							{hasChildren && <Folder className="w-[18px]" />}
							{!hasChildren && <Tag className="w-[18px]" />}
						</div>
						<span
							className={cn('ml-2 select-none text-sm sm:text-xs font-medium', {
								'font-normal text-gray-400': !hasChildren,
							})}
						>
							{item.name}
						</span>

						<div className="flex w-[64px] items-center justify-center gap-1">
							{!item.is_active && (
								<TooltipIcon
									title="Trạng thái danh mục không hoạt động"
									icon={
										<Ban className="cursor-pointer w-[14px] text-red-600 stroke-2	" />
									}
								/>
							)}
							{item.is_internal && (
								<TooltipIcon
									title="Danh mục này không công khai"
									icon={
										<EyeOff
											color="#889096"
											className="cursor-pointer w-[14px]"
										/>
									}
								/>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 hover:cursor-pointer">
						<Tooltip
							className=""
							// style={{ zIndex: 1 }}
							title={
								<>
									{'Thêm mục danh sách vào'}{' '}
									<span className="text-grey-80 font-semibold">
										{`"${item.name}"`}
									</span>
								</>
							}
						>
							<Button
								data-testid="addSubCategory"
								type="text"
								shape="circle"
								onClick={() => props.handleCreateSubCategory(item)}
								icon={<Plus color="#687076" size={14} />}
							/>
						</Tooltip>
						<Dropdown menu={{ items: itemDropdown, onClick: handleMenuClick }}>
							<a
								onClick={(e) => e.preventDefault()}
								data-testid="dropdownCategory"
							>
								<Ellipsis />
							</a>
						</Dropdown>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CategoryItem;
