import {
	AdminPostOrdersOrderClaimsReq,
	Order,
	ProductVariant,
} from '@medusajs/medusa';
import { Divider, message } from 'antd';
import { LoaderCircle } from 'lucide-react';

import { Select } from '@/components/Select';
import { getErrorMessage } from '@/lib/utils';
import { Option, Subset } from '@/types/shared';
import {
	useAdminCreateClaim,
	useAdminOrder,
	useAdminShippingOptions,
} from 'medusa-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Radio, RadioGroup } from '@/components/Radio';
import { Table } from '@/components/Table';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import AddProductVariant from '@/modules/orders/components/common/add-product-variant';
import { getDefaultClaimValues } from '@/modules/orders/components/orders/utils/get-default-values';
import { CreateClaimFormType } from '@/types/order';
import { formatAmountWithSymbol } from '@/utils/prices';
import _ from 'lodash';
import RMAReturnProductsTable from '../rma-return-product-table';
import productsColumns from './products-column';
import { EditableCell, EditableRow } from './products-component';

type ClaimProps = {
	order: Order;
	state: boolean;
	onClose: () => void;
};

type SelectProduct = Omit<
	ProductVariant & { quantity: number },
	'beforeInsert'
>;

const extractPrice = (prices: any, order: any, quantity?: number) => {
	let price = prices.find((ma: any) => ma?.region_id === order?.region_id);

	if (!price) {
		price = prices.find(
			(ma: any) => ma?.currency_code === order?.currency_code
		);
	}

	if (price) {
		return formatAmountWithSymbol({
			currency: order.currency_code,
			amount: price.amount * (1 + order.tax_rate / 100) * (quantity ?? 1),
		});
	}

	return 0;
};

const ClaimModal: React.FC<ClaimProps> = ({ order, state, onClose }) => {
	const { refetch } = useAdminOrder(order.id);
	const { mutateAsync, isLoading } = useAdminCreateClaim(order.id);

	const [itemsToAdd, setItemsToAdd] = useState<SelectProduct[]>([]);

	const [shippingMethod, setShippingMethod] = useState<Option | null>(null);
	const [shippingMethodReplace, setShippingMethodReplace] =
		useState<Option | null>(null);
	const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
	const [dataSource, setDataSource] = useState<any>(null);
	const [defaultClaim, setDefaultClaim] =
		useState<Subset<CreateClaimFormType> | null>(null);

	useEffect(() => {
		if (order) {
			const defaultValue = getDefaultClaimValues(order);
			setDefaultClaim(defaultValue);
			setDataSource(defaultValue?.return_items?.items);
		}
	}, [order]);

	const { shipping_options: shippingOptions, isLoading: shippingLoading } =
		useAdminShippingOptions({
			is_return: true,
			region_id: order.region_id,
		});


	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedVariants(selectedRowKeys as string[]);
	};

	const handleQuantity = (change: number, item: any) => {
		if (
			(item?.quantity === item?.original_quantity && change > 0) ||
			(item?.quantity === 1 && change < 0)
		) {
			return;
		}

		const newReceives = [...dataSource];
		const indexReceiveItem = newReceives?.findIndex(
			(receive: any) => receive.item_id === item.item_id
		);
		newReceives?.splice(indexReceiveItem, 1, {
			...item,
			quantity: item.quantity + change,
		});
		setDataSource(newReceives as any);
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
	};

	const handleReason = (reason: any, itemId: string) => {
		const newVariants = [...dataSource];
		const indexVariant = newVariants.findIndex(
			(variant) => itemId === variant.item_id
		);

		newVariants.splice(indexVariant, 1, {
			...newVariants[indexVariant],
			reason: reason?.reason || null,
			note: reason?.note || '',
		});

		setDataSource(newVariants as any);
	};

	const handleShippingSelectedReplace = (
		selectedItem: string,
		selectOption: Option
	) => {
		if (!shippingOptions) {
			return;
		}

		setShippingMethodReplace(selectOption);
	};

	// useEffect(() => {
	// 	if (!useCustomShippingPrice && shippingMethod && shippingOptions) {
	// 		const method = shippingOptions.find((o) => shippingMethod.value === o.id);
	// 		setShippingPrice(method?.amount as number);
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [useCustomShippingPrice, shippingMethod]);

	const onAddVariants = (
		variantIds: SelectProduct['id'],
		variants: SelectProduct[]
	) => {
		setItemsToAdd((itemsToAdd) => [
			...itemsToAdd,
			...variants.map((variant) => ({ ...variant, quantity: 1 })),
		]);
	};

	const onSubmit = () => {
		const type = defaultClaim?.claim_type?.type;
		if (type === 'replace') {
			if (!shippingMethodReplace) {
				message.error('Phương thức vận chuyển chưa được lựa chọn.');
				return;
			}
			if (_.isEmpty(itemsToAdd)) {
				message.error('Sản phẩm để thay thế chưa được chọn.');
				return;
			}
		} else {
			if (!shippingMethod) {
				message.error('Phương thức vận chuyển chưa được lựa chọn.');
				return;
			}
			if (_.isEmpty(dataSource)) {
				message.error('Sản phẩm để khiếu nại chưa được chọn.');
				return;
			}
		}
		const items = dataSource
			.filter((item: any) => selectedVariants?.includes(item.item_id))
			.map((item: any) => {
				return {
					item_id: item.item_id,
					note: item?.note ?? undefined,
					quantity: item.quantity,
					reason: item?.reason?.value ?? '',
					// reason: item.return_reason_details?.reason ?? undefined,
				};
			});
		const data: AdminPostOrdersOrderClaimsReq = {
			claim_items: items,
			type: type === 'replace' ? 'replace' : 'refund',
			return_shipping: {
				option_id: shippingMethod?.value,
				price: 0,
			},
			additional_items:
				type === 'replace'
					? itemsToAdd.map((i) => ({
							variant_id: i.id,
							quantity: i.quantity,
					  }))
					: undefined,
			no_notification: false,
			shipping_address:
				type === 'replace'
					? {
							address_1: defaultClaim?.shipping_address?.address_1,
							address_2: defaultClaim?.shipping_address?.address_2 ?? undefined,
							city: defaultClaim?.shipping_address?.city,
							country_code: defaultClaim?.shipping_address?.country_code?.value,
							company: defaultClaim?.shipping_address?.company ?? undefined,
							first_name: defaultClaim?.shipping_address?.first_name,
							last_name: defaultClaim?.shipping_address?.last_name,
							phone: defaultClaim?.shipping_address?.phone ?? undefined,
							postal_code: defaultClaim?.shipping_address?.postal_code,
							province: defaultClaim?.shipping_address?.province ?? undefined,
					  }
					: undefined,
			return_location_id: undefined,
			shipping_methods:
				type === 'replace' && shippingMethodReplace
					? [
							{
								option_id: shippingMethodReplace.value,
								price: 0,
							},
					  ]
					: undefined,
		};

		return mutateAsync(data, {
			onSuccess: () => {
				refetch();
				message.success('Đăng ký khiếu nại sản phẩm thành công');
				onClose();
			},
			onError: (err: any) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const refundAmount = useMemo(() => {
		if (dataSource?.length && selectedVariants?.length) {
			const itemsClaim = dataSource.filter((item: any) =>
				selectedVariants.includes(item.item_id)
			);
			const claimItemsRefund = itemsClaim.reduce((acc: number, item: any) => {
				return acc + (item.total / item.original_quantity) * item.quantity;
			}, 0);

			return claimItemsRefund < 0 ? 0 : claimItemsRefund;
		}
		return 0;
	}, [dataSource, selectedVariants]);

	const handleReceiveToggle = (record: any, selected: boolean) => {
		if (selected) {
			return;
		} else {
			const newReceives = [...(dataSource as any)];
			const indexReceiveItem = newReceives?.findIndex(
				(receive: any) => receive.item_id === record.item_id
			);
			newReceives?.splice(indexReceiveItem, 1, {
				...record,
				reason: null,
				note: '',
				quantity: record.original_quantity,
			});
			setDataSource(newReceives as any);
		}
	};

	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	};

	const columns = productsColumns({ currencyCode: order.currency_code }).map(
		(col) => {
			if (!col?.editable) {
				return col;
			}
			return {
				...col,
				onCell: (record: any) => ({
					record,
					editable: selectedVariants.includes(record.item_id),
					dataIndex: col.dataIndex,
					title: col.title,
					handleQuantity,
					handleReason,
				}),
			};
		}
	);

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
				{'Khách hàng khiếu nại'}
			</Title>
			<div className="flex flex-col gap-2">
				<Text strong className="font-medium">
					{'Sản phẩm khách hàng khiếu nại'}
				</Text>
				<Table
					components={components}
					rowSelection={{
						type: 'checkbox',
						selectedRowKeys: selectedVariants,
						onChange: handleRowSelectionChange,
						preserveSelectedRowKeys: true,
						onSelect: handleReceiveToggle,
					}}
					columns={columns as any}
					dataSource={dataSource ?? []}
					rowKey="item_id"
					pagination={false}
					scroll={{ x: 400 }}
				/>
			</div>
			<div className="mt-4 flex flex-col">
				<Text strong className="font-medium">
					{'Vận chuyển'}
				</Text>
				<Text className="mb-2">
					{
						'Vận chuyển trả lại cho các mục đã được đòi lại bởi khách hàng là miễn phí.'
					}
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
			<div className="pt-6">
				<Text strong className="font-medium">
					{'Phương thức khiếu nại'}
				</Text>
				<RadioGroup
					className="w-full flex justify-start items-center gap-4 mt-2"
					value={defaultClaim?.claim_type?.type ?? 'refund'}
					onChange={({ target: { value } }) =>
						setDefaultClaim((prev) => ({
							...prev,
							claim_type: { type: value },
						}))
					}
				>
					<Radio value="refund" className="text-sm w-fit text-nowrap">
						Hoàn tiền
					</Radio>
					<Radio value="replace" className="text-sm w-fit text-nowrap">
						Thay thế
					</Radio>
				</RadioGroup>
			</div>
			{defaultClaim?.claim_type?.type === 'replace' && (
				<ItemsToSend
					order={order}
					itemsToAdd={itemsToAdd}
					setItemsToAdd={setItemsToAdd}
					onAddVariants={onAddVariants}
					defaultClaim={defaultClaim}
					shippingMethodReplace={shippingMethodReplace}
					handleShippingSelectedReplace={handleShippingSelectedReplace}
				/>
			)}
			<Divider className="my-6" />
			<div className="">
				<Text strong className="font-medium">
					{'Sản phẩm đang khiếu nại'}
				</Text>
				<div className="flex flex-col gap-y px-4">
					{dataSource
						?.filter((item: any) => selectedVariants?.includes(item.item_id))
						.map((item: any) => (
							<SummaryLineItem
								key={item.item_id}
								item={item}
								currencyCode={order.currency_code}
								order={order as any}
							/>
						))}
				</div>
			</div>
			{itemsToAdd?.length ? (
				<div className="">
					<Text strong className="font-medium">
						{'Sản phẩm thay thế'}
					</Text>
					<div className="flex flex-col gap-y px-4">
						{itemsToAdd.map((item: any) => (
							<SummaryLineItem
								key={item.item_id}
								item={item}
								currencyCode={order.currency_code}
								order={order as any}
								isReplace={true}
							/>
						))}
					</div>
				</div>
			) : (
				<></>
			)}
			<Divider className="my-6" />
			<div className="font-semibold mt-4 flex items-center justify-between">
				<span>{'Số tiền hoàn trả'}</span>
				<span className="font-semibold">
					{formatAmountWithSymbol({
						currency: order.currency_code,
						amount: refundAmount,
						tax: order.tax_rate ?? undefined,
					})}
				</span>
			</div>
		</Modal>
	);
};

export default ClaimModal;

const SummaryLineItem = ({
	item,
	currencyCode,
	isReplace = false,
	order,
}: {
	item: any;
	currencyCode: string;
	isReplace?: boolean;
	order?: string;
}) => {
	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] flex h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item?.thumbnail || item?.product?.thumbnail ? (
						<Image
							src={isReplace ? item?.product?.thumbnail : item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${
								isReplace ? item?.product.title : item.product_title
							}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<div className="flex max-w-[185px] flex-col justify-center text-[12px]">
					<span className="font-normal text-gray-900 truncate">
						{`${isReplace ? item?.product?.title : item.product_title}`}
					</span>
					<span className="font-normal text-gray-500 truncate">
						{`${isReplace ? item?.title : item.variant_title}`}
					</span>
				</div>
			</div>
			<div className="flex items-center">
				<div className="md:space-x-2 lg:space-x-4 2xl:space-x-6 mr-3 flex text-[12px]">
					<div className="font-normal text-gray-500">
						{isReplace
							? extractPrice(item?.prices, order)
							: formatAmountWithSymbol({
									amount: item.total / item.original_quantity,
									currency: currencyCode,
									tax: [],
							  })}
					</div>
					<div className="font-normal text-gray-500">x {item.quantity}</div>
					<div className="font-normal text-gray-900 min-w-[55px] text-right">
						{isReplace
							? extractPrice(item?.prices, order, item.quantity)
							: formatAmountWithSymbol({
									amount:
										(item.total / item.original_quantity) * item.quantity || 0,
									currency: currencyCode,
									tax: [],
							  })}
					</div>
				</div>
				<div className="font-normal text-gray-500 text-[12px]">
					{currencyCode.toUpperCase()}
				</div>
			</div>
		</div>
	);
};

const ItemsToSend = ({
	order,
	itemsToAdd,
	setItemsToAdd,
	onAddVariants,
	defaultClaim,
	shippingMethodReplace,
	handleShippingSelectedReplace,
}: any) => {
	const { shipping_options: shippingOptions, isLoading: shippingLoading } =
		useAdminShippingOptions({
			is_return: false,
			region_id: order.region_id,
		});

	const {
		state: stateAddProduct,
		onOpen: openAddProduct,
		onClose: closeAddProduct,
	} = useToggleState(false);

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

	return (
		<>
			<div className="mt-4 mb-2 flex items-center justify-between">
				<Text strong className="font-medium mb-2">
					{'Các sản phẩm cần gửi'}
				</Text>
				<Button type="default" onClick={openAddProduct}>
					{'Thêm sản phẩm'}
				</Button>
				{stateAddProduct && (
					<AddProductVariant
						title="Thêm biến thể sản phẩm"
						state={stateAddProduct}
						onClose={closeAddProduct}
						onSubmit={onAddVariants}
						customerId={order.customerId}
						regionId={order.regionId}
						currencyCode={order.currency_code}
					/>
				)}
			</div>
			{itemsToAdd?.length ? (
				<RMAReturnProductsTable
					isAdditionalItems
					order={order}
					itemsToAdd={itemsToAdd}
					handleRemoveItem={handleRemoveItem}
					handleToAddQuantity={handleToAddQuantity}
				/>
			) : (
				<></>
			)}
			<div className="mt-4 mb-2 flex items-start justify-between">
				<div className="flex flex-col items-start">
					<Text strong className="font-medium">
						{'Địa chỉ giao hàng'}
					</Text>
					<Text className="text-gray-500">
						{defaultClaim?.shipping_address?.address_1}
					</Text>
					<Text className="text-gray-500">{`${defaultClaim?.shipping_address?.postal_code} ${defaultClaim?.shipping_address?.city}`}</Text>
					<Text className="text-gray-500">{`${defaultClaim?.shipping_address?.province} ${defaultClaim?.shipping_address?.country_code?.label}`}</Text>
				</div>
				<Button type="default" onClick={() => {}}>
					{'Gửi đến địa chỉ giao hàng khác'}
				</Button>
			</div>
			<div className="mt-4 flex flex-col">
				<Text strong className="font-medium">
					{'Vận chuyển cho các sản phẩm thay thế'}
				</Text>
				<Text className="mb-2">
					{'Vận chuyển cho các mục thay thế là miễn phí..'}
				</Text>
				{shippingLoading ? (
					<div className="flex justify-center">
						<LoaderCircle size={20} className="animate-spin" />
					</div>
				) : (
					<Select
						className="mt-2"
						placeholder="Chọn phương thức vận chuyển"
						value={shippingMethodReplace?.value}
						onChange={handleShippingSelectedReplace}
						options={
							shippingOptions?.map((o) => ({
								label: o.name,
								value: o.id,
							})) || []
						}
					/>
				)}
			</div>
		</>
	);
};
