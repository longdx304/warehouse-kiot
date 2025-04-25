import {
	AdminGetVariantsVariantInventoryRes,
	AdminPostOrdersOrderReturnsReq,
	LevelWithAvailability,
	Order,
	LineItem as RawLineItem,
} from '@medusajs/medusa';
import { message } from 'antd';
import { LoaderCircle, SquareArrowOutUpRight } from 'lucide-react';

import { Select } from '@/components/Select';
import { getErrorMessage } from '@/lib/utils';
import { Option } from '@/types/shared';
import { formatAmountWithSymbol } from '@/utils/prices';
import {
	useAdminRequestReturn,
	useAdminShippingOptions,
	useAdminStockLocations,
	useMedusa,
} from 'medusa-react';
import React, { useEffect, useState } from 'react';

import { Modal } from '@/components/Modal';
import { Text, Title } from '@/components/Typography';
import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';
import { getAllReturnableItems } from '@/modules/orders/components/orders/utils/create-filtering';
import { removeFalsy } from '@/utils/remove-nullish';
import RMASelectProductTable from '../rma-select-product-table';
import { useRouter } from 'next/navigation';

type ReturnMenuProps = {
	order: Order;
	state: boolean;
	onClose: () => void;
};

type LineItem = Omit<RawLineItem, 'beforeInsert'>;

const ReturnMenu: React.FC<ReturnMenuProps> = ({ order, state, onClose }) => {
	const router = useRouter();
	const { client } = useMedusa();
	const { isFeatureEnabled } = useFeatureFlag();
	const isLocationFulfillmentEnabled =
		isFeatureEnabled('inventoryService') &&
		isFeatureEnabled('stockLocationService');

	const [submitting, setSubmitting] = useState(false);
	const [refundEdited, setRefundEdited] = useState(false);
	const [refundable, setRefundable] = useState(0);
	const [refundAmount, setRefundAmount] = useState(0);
	const [selectedLocation, setSelectedLocation] = useState<{
		value: string;
		label: string;
	} | null>(null);
	const [toReturn, setToReturn] = useState<
		Record<string, { quantity: number }>
	>({});
	const [useCustomShippingPrice, setUseCustomShippingPrice] = useState(false);

	const [shippingPrice, setShippingPrice] = useState<number>();
	const [shippingMethod, setShippingMethod] = useState<Option | null>(null);

	const [allItems, setAllItems] = useState<Omit<LineItem, 'beforeInsert'>[]>(
		[]
	);

	const { stock_locations, refetch } = useAdminStockLocations(
		{},
		{
			enabled: isLocationFulfillmentEnabled,
		}
	);

	React.useEffect(() => {
		if (isLocationFulfillmentEnabled) {
			refetch();
		}
	}, [isLocationFulfillmentEnabled, refetch]);

	const requestReturnOrder = useAdminRequestReturn(order.id);

	useEffect(() => {
		if (order) {
			setAllItems(getAllReturnableItems(order, false));
		}
	}, [order]);

	const itemMap = React.useMemo(() => {
		return new Map<string, LineItem>(order.items.map((i) => [i.id, i]));
	}, [order.items]);

	const [inventoryMap, setInventoryMap] = useState<
		Map<string, LevelWithAvailability[]>
	>(new Map());

	React.useEffect(() => {
		const getInventoryMap = async () => {
			if (!allItems.length || !isLocationFulfillmentEnabled) {
				return new Map();
			}
			const itemInventoryList = await Promise.all(
				allItems.map(async (item) => {
					if (!item.variant_id) {
						return undefined;
					}
					return await client.admin.variants.getInventory(item.variant_id);
				})
			);

			return new Map(
				itemInventoryList
					.filter((it) => !!it)
					.map((item) => {
						const { variant } = item as AdminGetVariantsVariantInventoryRes;
						return [variant.id, variant.inventory[0]?.location_levels];
					})
			);
		};

		getInventoryMap().then((map) => {
			setInventoryMap(map);
		});
	}, [allItems, client.admin.variants, isLocationFulfillmentEnabled]);

	const locationsHasInventoryLevels = React.useMemo(() => {
		return Object.entries(toReturn)
			.map(([itemId]) => {
				const item = itemMap.get(itemId);
				if (!item?.variant_id) {
					return true;
				}
				const hasInventoryLevel = inventoryMap
					.get(item.variant_id)
					?.find((l) => l.location_id === selectedLocation?.value);

				if (!hasInventoryLevel && selectedLocation?.value) {
					return false;
				}
				return true;
			})
			.every(Boolean);
	}, [toReturn, itemMap, selectedLocation?.value, inventoryMap]);

	const { isLoading: shippingLoading, shipping_options: shippingOptions } =
		useAdminShippingOptions({
			region_id: order.region_id,
			is_return: true,
		});

	const handleShippingSelected = (
		selectedItem: string,
		selectOption: Option
	) => {
		setShippingMethod(selectOption);
		// const method = shippingOptions?.find((o) => selectedItem.value === o.id)

		// if (method) {
		//   setShippingPrice(method.price_incl_tax)
		// }
	};
	useEffect(() => {
		const items = Object.keys(toReturn)
			.map((t) => allItems.find((i) => i.id === t))
			.filter((i) => typeof i !== 'undefined') as LineItem[];

		const itemTotal = items.reduce((acc: number, curr: any): number => {
			const unitRefundable =
				(curr.refundable || 0) / (curr.quantity - curr.returned_quantity);

			return acc + unitRefundable * toReturn[curr.id].quantity;
		}, 0);

		const total = itemTotal - (shippingPrice || 0);

		setRefundable(total);

		setRefundAmount(total);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toReturn, shippingPrice]);

	const onSubmit = async () => {
		const items = Object.entries(toReturn).map(([key, value]: any) => {
			const toSet = {
				reason_id: value?.reason || null,
				...value,
			};
			delete toSet.reason;
			const clean = removeFalsy(toSet);
			return {
				item_id: key,
				...(clean as { quantity: number }),
			};
		});

		const data: AdminPostOrdersOrderReturnsReq = {
			items,
			refund: Math.round(refundAmount),
			no_notification: undefined,
		};

		if (selectedLocation && isLocationFulfillmentEnabled) {
			data.location_id = selectedLocation.value;
		}

		if (shippingMethod) {
			// const taxRate = shippingMethod.tax_rates.reduce((acc, curr) => {
			// 	return acc + curr.rate / 100;
			// }, 0);

			data.return_shipping = {
				option_id: shippingMethod.value,
				price: shippingPrice ? Math.round(shippingPrice / 1) : 0,
			};
		}

		setSubmitting(true);
		return requestReturnOrder
			.mutateAsync(data)
			.then(() => {
				onClose();
				message.success('Đã yêu cầu trả lại đơn hàng');
			})
			.catch((error) => message.error(getErrorMessage(error)))
			.finally(() => setSubmitting(false));
	};

	const handleRefundUpdated = (value: any) => {
		if (value < order.refundable_amount && value >= 0) {
			setRefundAmount(value);
		}
	};

	useEffect(() => {
		if (!useCustomShippingPrice && shippingMethod) {
			const method = shippingOptions?.find(
				(o) => shippingMethod.value === o.id
			);

			if (method) {
				setShippingPrice(0);
				// setShippingPrice(method.price_incl_tax);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [useCustomShippingPrice, shippingMethod]);

	const handleUpdateShippingPrice = (value: any) => {
		if (value >= 0) {
			setShippingPrice(value);
		}
	};

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={submitting}
			disabled={submitting}
			handleCancel={onClose}
			width={800}
		>
			<Title level={4} className="text-center mb-2">
				{'Yêu cầu trả lại'}
			</Title>
			<div className="flex flex-col gap-2">
				<Text strong className="font-medium mb-2">
					{'Các mục cần trả lại'}
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
			{refundable >= 0 && (
				<div className="mt-10">
					{!useCustomShippingPrice && shippingMethod && (
						<div className="font-normal mb-4 flex justify-between">
							<span>{'Vận chuyển'}</span>
							<div>
								{formatAmountWithSymbol({
									amount: shippingPrice || 0,
									currency: order.currency_code,
								})}{' '}
								<span className="text-gray-400 ml-3">
									{order.currency_code.toUpperCase()}
								</span>
							</div>
						</div>
					)}
					<div className="font-medium flex w-full justify-between items-center">
						<span>{'Tổng tiền hoàn trả'}</span>
						<div className="flex items-center">
							{!refundEdited && (
								<div className="flex items-center">
									<span
										className="text-gray-400 mr-2 cursor-pointer flex items-center"
										// onClick={() => setRefundEdited(true)}
									>
										<SquareArrowOutUpRight size={16} />
									</span>
									{`${formatAmountWithSymbol({
										amount: refundAmount || 0,
										currency: order.currency_code,
									})}`}
								</div>
							)}
						</div>
					</div>
					{/* {refundEdited && (
						<CurrencyInput.Root
							className="mt-2"
							size="small"
							currentCurrency={order.currency_code}
							readOnly
						>
							<CurrencyInput.Amount
								label={t("returns-amount", "Amount")}
								amount={refundAmount}
								onChange={handleRefundUpdated}
							/>
						</CurrencyInput.Root>
					)} */}
				</div>
			)}
		</Modal>
	);
};

export default ReturnMenu;
