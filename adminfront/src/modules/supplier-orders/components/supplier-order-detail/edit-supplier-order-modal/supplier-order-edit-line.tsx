import { ActionAbles } from '@/components/Dropdown';
import { InputNumber } from '@/components/Input';
import { Popconfirm } from '@/components/Popconfirm';
import {
	useAdminDeleteSOrderEditItemChange,
	useAdminSupplierOrderEditAddLineItem,
	useAdminSupplierOrderEditDeleteLineItem,
	useAdminSupplierOrderEditUpdateLineItem,
} from '@/lib/hooks/api/supplier-order-edits';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { formatAmountWithSymbol } from '@/utils/prices';
import { LineItem, OrderItemChange } from '@medusajs/medusa';
import { message } from 'antd';
import clsx from 'clsx';
import { CopyPlus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type SupplierOrderEditLineProps = {
	item: LineItem;
	customerId?: string;
	regionId?: string;
	currencyCode: string;
	change?: OrderItemChange;
};

const SupplierOrderEditLine = ({
	item,
	currencyCode,
	change,
}: SupplierOrderEditLineProps) => {
	const isNew = change?.type === 'item_add';
	const isModified = change?.type === 'item_update';
	const isLocked = !!item.fulfilled_quantity;

	const [isLoading, setIsLoading] = useState(false);
	const [quantity, setQuantity] = useState(item.quantity);
	const [draftQuantity, setDraftQuantity] = useState(item.quantity);
	const [unitPrice, setUnitPrice] = useState<number>(item.unit_price);

	const { mutateAsync: addLineItem, isLoading: loadingAddLineItem } =
		useAdminSupplierOrderEditAddLineItem(item.order_edit_id!);

	const { mutateAsync: removeItem } = useAdminSupplierOrderEditDeleteLineItem(
		item.order_edit_id!,
		item.id
	);

	const { mutateAsync: updateItem, isLoading: updateItemLoading } =
		useAdminSupplierOrderEditUpdateLineItem(item.order_edit_id!, item.id);

	const { mutateAsync: undoChange } = useAdminDeleteSOrderEditItemChange(
		item.order_edit_id!,
		change?.id as string
	);

	const onQuantityUpdate = async () => {
		if (quantity === draftQuantity || isLoading) {
			return;
		}

		setIsLoading(true);

		try {
			await updateItem({ quantity: draftQuantity });
			setQuantity(draftQuantity);
			message.success('Cập nhật số lượng sản phẩm thành công');
		} catch (error) {
			message.error('Cập nhật thất bại');
			console.error('Error updating quantity:', error);
			setDraftQuantity(quantity);
		} finally {
			setIsLoading(false);
		}
	};

	const onUnitPriceUpdate = async () => {
		if (isLoading) {
			return;
		}

		try {
			await updateItem({ unit_price: unitPrice });
			setUnitPrice(unitPrice);
			message.success('Cập nhật giá tiền thành công');
		} catch (error) {
			message.error('Cập nhật thất bại');
			console.error('Error updating quantity:', error);
		}
	};

	const onDuplicate = async () => {
		if (!item.variant) {
			message.warning('Không thể sao chép một mục mà không có biến thể');
			return;
		}

		try {
			await addLineItem({
				variant_id: item.variant_id as string,
				quantity: item.quantity,
				unit_price: item.unit_price,
			});
		} catch (e) {
			message.error('Không thể sao chép sản phẩm');
		}
	};

	const onRemove = async () => {
		try {
			if (change) {
				if (change.type === 'item_add') {
					await undoChange();
				}
				if (change.type === 'item_update') {
					await undoChange();
					await removeItem();
				}
			} else {
				await removeItem();
			}
			message.success('Sản phẩm đã bị xóa');
		} catch (e) {
			message.error('Không thể xóa sản phẩm');
		}
	};

	const actions = [
		{
			label: <span className="w-full">{'Sao chép mục'}</span>,
			onClick: onDuplicate,
			icon: <CopyPlus size={20} />,
		},
		{
			label: <span className="w-full">{'Xóa mục'}</span>,
			onClick: onRemove,
			variant: 'danger',
			icon: <Trash2 size={20} />,
		},
	].filter(Boolean);

	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] mb-1 flex min-h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item.thumbnail ? (
						<Image
							src={item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${item.title}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<div className="flex max-w-[185px] flex-col justify-center text-[12px]">
					<div className="flex flex-col-reverse lg:flex-row justify-start items-start lg:items-center lg:gap-2">
						<span className="font-normal text-gray-900 truncate">
							{item.title}
						</span>

						{isNew && (
							<div className="text-xs bg-blue-100 rounded-md mr-2 flex h-[24px] w-[42px] flex-shrink-0 items-center justify-center text-blue-500">
								{'Mới'}
							</div>
						)}

						{isModified && (
							<div className="text-xs bg-orange-100 rounded-md mr-2 flex h-[24px] w-[68px] flex-shrink-0 items-center justify-center text-orange-500">
								{'Đã sửa đổi'}
							</div>
						)}
					</div>
					{item?.variant && (
						<span className="font-normal text-gray-500 truncate">
							{`${item.variant.title}${
								item.variant.sku ? ` (${item.variant.sku})` : ''
							}`}
						</span>
					)}
				</div>
			</div>
			<div className="flex items-center">
				<div className="flex h-full items-center gap-2 sm:gap-6">
					<div className="flex flex-row flex-wrap gap-4 items-center sm:gap-6">
						<div
							className={clsx('flex flex-grow-0 items-centere text-gray-400', {
								'pointer-events-none': isLocked,
							})}
						>
							<InputNumber
								placeholder="Thay đổi số lượng"
								className={clsx('cursor-pointer text-gray-400 w-[80px]', {
									'pointer-events-none': isLoading,
								})}
								value={draftQuantity}
								onChange={(value) => setDraftQuantity(Number(value))}
								onBlur={onQuantityUpdate}
								disabled={isLocked || isLoading}
							/>
						</div>
						<div className="flex sm:flex-row flex-col items-end">
							<div
								className={clsx(
									'space-x-2 flex items-center text-end text-sm',
									{
										'pointer-events-none !text-gray-400': isLocked,
									}
								)}
							>
								<Popconfirm
									title="Chỉnh sửa giá"
									description={
										<InputNumber
											placeholder="Thay đổi số lượng"
											className={clsx(
												'cursor-pointer text-gray-400 my-2 w-[130px]',
												{
													'pointer-events-none': isLoading,
												}
											)}
											value={unitPrice}
											onChange={(value) => setUnitPrice(Number(value))}
											disabled={isLocked || isLoading}
										/>
									}
									isLoading={updateItemLoading}
									handleOk={onUnitPriceUpdate}
									handleCancel={() => {}}
									icon={null}
								>
									<Pencil size={16} />
								</Popconfirm>
								<div
									className={clsx('text-gray-900', {
										'pointer-events-none !text-gray-400': isLocked,
									})}
								>
									{formatAmountWithSymbol({
										amount: item.unit_price,
										currency: currencyCode,
										tax: item.includes_tax ? 0 : item.tax_lines,
									})}
								</div>
							</div>
							<div
								className={clsx('space-x-2 flex text-sm', {
									'pointer-events-none !text-gray-400': isLocked,
								})}
							>
								<div
									className={clsx('min-w-[60px] text-right text-gray-900', {
										'pointer-events-none !text-gray-400': isLocked,
									})}
								>
									{' = ' +
										formatAmountWithSymbol({
											amount: item.unit_price * item.quantity,
											currency: currencyCode,
											tax: item.includes_tax ? 0 : item.tax_lines,
										})}
								</div>
							</div>
						</div>
					</div>
					<ActionAbles actions={actions as any} />
				</div>
			</div>
		</div>
	);
};

export default SupplierOrderEditLine;
