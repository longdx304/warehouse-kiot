import {
	AdminPostOrdersOrderSwapsReq,
	Order,
	ProductVariant,
	ReturnReason,
} from '@medusajs/medusa';
import { message } from 'antd';
import { LoaderCircle } from 'lucide-react';

import { Select } from '@/components/Select';
import { Option } from '@/types/shared';
import { getErrorMessage } from '@/lib/utils';
import {
	useAdminCreateSwap,
	useAdminShippingOptions,
	useAdminOrder,
	useAdminStockLocations,
} from 'medusa-react';
import React, { useEffect, useState, useMemo } from 'react';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Text, Title } from '@/components/Typography';
import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';
import { getAllReturnableItems } from '@/modules/orders/components/orders/utils/create-filtering';
import RMASelectProductTable from '../rma-select-product-table';
import AddProductVariant from '@/modules/orders/components/common/add-product-variant';
import useToggleState from '@/lib/hooks/use-toggle-state';
import RMAReturnProductsTable from '../rma-return-product-table';
import _ from 'lodash';
import { formatAmountWithSymbol } from '@/utils/prices';

type ReturnMenuProps = {
	order: Order;
	state: boolean;
	onClose: () => void;
};

type SelectProduct = Omit<
	ProductVariant & { quantity: number },
	'beforeInsert'
>;

const SwapModal: React.FC<ReturnMenuProps> = ({ order, state, onClose }) => {
	const { refetch } = useAdminOrder(order.id);
	const { mutateAsync, isLoading } = useAdminCreateSwap(order.id);
	const { isFeatureEnabled } = useFeatureFlag();
	const isLocationFulfillmentEnabled =
		isFeatureEnabled('inventoryService') &&
		isFeatureEnabled('stockLocationService');

	const [itemsToAdd, setItemsToAdd] = useState<SelectProduct[]>([]);
	const [toReturn, setToReturn] = useState<
		Record<string, { quantity: number }>
	>({});
	const [useCustomShippingPrice, setUseCustomShippingPrice] = useState(false);

	const [shippingPrice, setShippingPrice] = useState<number>(0);
	const [shippingMethod, setShippingMethod] = useState<Option | null>(null);

	const {
		state: stateAddProduct,
		onOpen: openAddProduct,
		onClose: closeAddProduct,
	} = useToggleState(false);

	const {
		stock_locations,
		refetch: refetchLocations,
		isLoading: isLoadingLocations,
	} = useAdminStockLocations(
		{},
		{
			enabled: isLocationFulfillmentEnabled,
		}
	);

	React.useEffect(() => {
		if (isLocationFulfillmentEnabled) {
			refetchLocations();
		}
	}, [isLocationFulfillmentEnabled, refetchLocations]);

	// Includes both order items and swap items
	const allItems = useMemo(() => {
		if (order) {
			return getAllReturnableItems(order, false);
		}
		return [];
	}, [order]);

	const { shipping_options: shippingOptions, isLoading: shippingLoading } =
		useAdminShippingOptions({
			is_return: true,
			region_id: order.region_id,
		});

	const returnTotal = useMemo(() => {
		const items = Object.keys(toReturn).map((t) =>
			allItems.find((i) => i.id === t)
		);

		return (
			items.reduce((acc, next) => {
				if (!next) {
					return acc;
				}

				return (
					acc +
					((next.refundable || 0) /
						(next.quantity - (next.returned_quantity as any))) *
						toReturn[next.id].quantity
				);
			}, 0) - (shippingPrice || 0)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toReturn, shippingPrice]);

	const additionalTotal = useMemo(() => {
		return itemsToAdd.reduce((acc, next) => {
			let amount = next.prices.find(
				(ma) => ma.region_id === order.region_id
			)?.amount;

			if (!amount) {
				amount = next.prices.find(
					(ma) => ma.currency_code === order.currency_code
				)?.amount;
			}

			if (!amount) {
				amount = 0;
			}

			const lineTotal = amount * next.quantity;
			return acc + lineTotal;
		}, 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemsToAdd]);

	const handleToAddQuantity = (value: number, itemId: string) => {
		const updated = [...itemsToAdd];
		const itemInx = updated.findIndex((item) => item.id === itemId);
		const itemToUpdate = updated[itemInx];

		if (itemToUpdate.quantity === 1 && value < 0) return;
		updated[itemInx] = {
			...itemToUpdate,
			quantity: itemToUpdate.quantity + value,
		};

		setItemsToAdd(updated);
	};

	const handleRemoveItem = (itemId: string) => {
		const updated = [...itemsToAdd];
		const itemDeleteInx = updated.findIndex((item) => item.id === itemId);
		updated.splice(itemDeleteInx, 1);
		setItemsToAdd(updated);
	};

	const handleShippingSelected = (
		selectedItem: string,
		selectOption: Option
	) => {
		if (!shippingOptions) {
			return;
		}

		setShippingMethod(selectOption);
		// const method = shippingOptions?.find((o) => selectedItem.value === o.id)
		setShippingPrice(0);
	};

	const handleUpdateShippingPrice = (value: number | undefined) => {
		if (value !== undefined && value >= 0) {
			setShippingPrice(value);
		} else {
			setShippingPrice(0);
		}
	};

	useEffect(() => {
		if (!useCustomShippingPrice && shippingMethod && shippingOptions) {
			const method = shippingOptions.find((o) => shippingMethod.value === o.id);
			setShippingPrice(method?.amount as any);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [useCustomShippingPrice, shippingMethod]);

	const onAddVariants = (
		variantIds: SelectProduct['id'],
		variants: SelectProduct[]
	) => {
		// const existingIds = itemsToAdd.map((i) => i.id)

		setItemsToAdd((itemsToAdd) => [
			...itemsToAdd,
			...variants
				// .filter((variant) => !existingIds.includes(variant.id))
				.map((variant) => ({ ...variant, quantity: 1 })),
		]);
	};

	const onSubmit = () => {
		if (_.isEmpty(itemsToAdd) || _.isEmpty(toReturn)) {
			message.error('Sản phẩm để trả lại/trao đổi chưa được chọn.');
			return;
		}
		if (!shippingMethod) {
			message.error('Vui lòng chọn phương thức vận chuyển.');
			return;
		}
		const items = Object.entries(toReturn).map(([key, value]: any) => {
			return {
				item_id: key,
				note: value.note ?? undefined,
				quantity: value.quantity,
				reason_id: value.reason ?? undefined,
			};
		});
		const data: AdminPostOrdersOrderSwapsReq = {
			return_items: items,
			additional_items: itemsToAdd.map((i) => ({
				variant_id: i.id,
				quantity: i.quantity,
			})),
			no_notification: false,
		};
		data.return_shipping = {
			option_id: shippingMethod.value,
			price: Math.round(shippingPrice || 0),
		};
		return mutateAsync(data, {
			onSuccess: () => {
				refetch();
				message.success('Đăng ký trao đổi sản phẩm thành công');
				onClose();
			},
			onError: (err: any) => {
				if (
					getErrorMessage(err) ===
					'Cannot swap an order that has not been captured'
				) {
					return message.error(
						'Không thể trao đổi đơn hàng khi chưa hoàn tất thanh toán'
					);
				} else if (
					getErrorMessage(err) ===
					'Cannot swap an order that has not been fulfilled'
				) {
					return message.error('Không thể trao đổi đơn hàng chưa được giao');
				}
				message.error(getErrorMessage(err));
			},
		});
	};

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={isLoading}
			disabled={isLoading}
			handleCancel={onClose}
			width={800}
		>
			<Title level={4} className="text-center mb-2">
				{'Đăng ký trao đổi'}
			</Title>
			<div className="flex flex-col gap-2">
				<Text strong className="font-medium">
					{'Các sản phẩm trả lại'}
				</Text>
				<RMASelectProductTable
					order={order}
					allItems={allItems}
					toReturn={toReturn}
					setToReturn={(items) => setToReturn(items)}
				/>
			</div>
			<div className="mt-4 flex flex-col">
				<Text strong className="font-medium">
					{'Vận chuyển'}
				</Text>
				<Text className="mb-2">
					{'Chọn phương thức vận chuyển bạn muốn sử dụng cho trả lại này.'}
				</Text>
				{shippingLoading ? (
					<div className="flex justify-center">
						<LoaderCircle size={20} className="animate-spin" />
					</div>
				) : (
					<Select
						className="mt-2"
						placeholder="Chọn phương thức vận chuyển"
						value={shippingMethod?.value}
						onChange={handleShippingSelected as any}
						options={
							shippingOptions?.map((o) => ({
								label: o.name,
								value: o.id,
							})) || []
						}
					/>
				)}
			</div>
			<div className="mt-4 mb-2 flex items-center justify-between">
				<Text strong className="font-medium mb-2">
					{'Các sản phẩm để gửi'}
				</Text>
				<Button type="default" onClick={openAddProduct}>
					{'Thêm sản phẩm'}
				</Button>
				{stateAddProduct && (
					<AddProductVariant
						title="Thêm biến thể sản phẩm"
						state={stateAddProduct}
						onClose={closeAddProduct}
						onSubmit={onAddVariants as any}
						customerId={order.customer_id}
						regionId={order.region_id}
						currencyCode={order.currency_code}
					/>
				)}
			</div>
			{itemsToAdd?.length ? (
				<>
					<RMAReturnProductsTable
						isAdditionalItems
						order={order}
						itemsToAdd={itemsToAdd}
						handleRemoveItem={handleRemoveItem}
						handleToAddQuantity={handleToAddQuantity}
					/>
				</>
			) : null}
			<div className="text-xs text-gray-900 font-normal mt-8 flex items-center justify-between">
				<span>{'Tổng trả hàng'}</span>
				<span>
					{formatAmountWithSymbol({
						currency: order.currency_code,
						amount: returnTotal,
					})}
				</span>
			</div>
			<div className="text-xs text-gray-900 font-normal mt-2 flex items-center justify-between">
				<span>{'Tổng thêm'}</span>
				<span>
					{formatAmountWithSymbol({
						currency: order.currency_code,
						amount: additionalTotal,
						tax: order.tax_rate ?? undefined,
					})}
				</span>
			</div>
			<div className="font-semibold mt-4 flex items-center justify-between">
				<span>{'Ước tính khác biệt'}</span>
				<span className="font-semibold">
					{formatAmountWithSymbol({
						currency: order.currency_code,
						amount: additionalTotal - returnTotal,
						tax: order.tax_rate ?? undefined,
					})}
				</span>
			</div>
		</Modal>
	);
};

export default SwapModal;
