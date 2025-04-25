import React, { useState, useEffect, useMemo } from 'react';
import {
	AdminPostReturnsReturnReceiveReq,
	Order,
	Return,
} from '@medusajs/medusa';
import { useAdminOrder, useAdminReceiveReturn, useMedusa } from 'medusa-react';
import { message, Divider } from 'antd';
import Image from 'next/image';
import { SquareArrowOutUpRight } from 'lucide-react';

import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';
import { getErrorMessage } from '@/lib/utils';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Modal } from '@/components/Modal';
import { Text, Title } from '@/components/Typography';
import useOrdersExpandParam from '@/modules/orders/components/orders/utils/use-admin-expand-parameter';
import { Table } from '@/components/Table';
import productsColumns from './products-column';
import { getDefaultReceiveReturnValues } from '@/modules/orders/components/orders/utils/get-default-values';
import { EditableRow, EditableCell } from './products-component';
import { ReceiveReturnItem } from '@/types/order';

type Props = {
	order: Order;
	returnRequest: Return;
	onClose: () => void;
	state: boolean;
	refetchOrder: () => void;
};

export const ReceiveReturnModal = ({
	order,
	returnRequest,
	onClose,
	state,
	refetchOrder,
}: Props) => {
	const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
	const [receiveItems, setReceiveItems] = useState<any>([]);
	const [dataSource, setDataSource] = useState<any>([]);
	const [refundAmount, setRefundAmount] = useState(0);

	const { isFeatureEnabled } = useFeatureFlag();

	const { mutateAsync, isLoading } = useAdminReceiveReturn(returnRequest.id);
	const { orderRelations } = useOrdersExpandParam();
	const { refetch } = useAdminOrder(order.id, {
		expand: orderRelations,
	});

	useEffect(() => {
		const initReceiveItems = getDefaultReceiveReturnValues(
			order,
			returnRequest
		);
		setReceiveItems(initReceiveItems);
		setDataSource(initReceiveItems?.receive_items?.items);
	}, [returnRequest, order]);
	/**
	 * If the return was refunded as part of a refund claim, we do not allow the user to
	 * specify a refund amount, or want to display a summary.
	 */
	const isRefundedClaim = useMemo(() => {
		if (returnRequest.claim_order_id) {
			const claim = order.claims.find(
				(c) => c.id === returnRequest.claim_order_id
			);
			if (!claim) {
				return false;
			}

			return claim.payment_status === 'refunded';
		}

		return false;
	}, [order.claims, returnRequest.claim_order_id]);

	/**
	 * If the return was created as a result of a swap, we do not allow the user to
	 * specify a refund amount, or want to display a summary.
	 */
	const isSwapOrRefundedClaim = useMemo(() => {
		return isRefundedClaim || Boolean(returnRequest.swap_id);
	}, [isRefundedClaim, returnRequest.swap_id]);

	const onSubmit = async () => {
		let refund: number | undefined = undefined;

		/**
		 * If the return was not refunded as part of a refund claim, or was not created as a
		 * result of a swap, we allow the user to specify a refund amount.
		 */
		if (refundAmount !== undefined && !isSwapOrRefundedClaim) {
			refund = refundAmount;
		}

		/**
		 * If the return was refunded as part of a refund claim, we set the refund amount to 0.
		 * This is a workaround to ensure that the refund is not issued twice.
		 */
		if (isRefundedClaim) {
			refund = 0;
		}

		const toCreate: AdminPostReturnsReturnReceiveReq = {
			items: dataSource.map((receive: ReceiveReturnItem) => ({
				item_id: receive.item_id,
				quantity: receive.quantity,
			})),
			refund,
		};
		await mutateAsync(toCreate, {
			onSuccess: () => {
				message.success(
					`Nhận trả hàng thành công. Nhận trả hàng cho đơn hàng #${order.display_id}`
				);

				// We need to refetch the order to get the updated state
				refetch();
				refetchOrder();

				onClose();
				setSelectedVariants([]);
			},
			onError: (error: any) => {
				message.error(`Không thể nhận trả hàng. ${getErrorMessage(error)}`);
			},
		});
	};

	useEffect(() => {
		const itemsReceived = dataSource.filter((item: any) =>
			selectedVariants.includes(item.item_id)
		);
		const itemTotal = itemsReceived.reduce((acc: number, curr: any) => {
			const priceRefundable = curr.quantity * curr.price;

			return acc + priceRefundable;
		}, 0);
		setRefundAmount(itemTotal);
	}, [dataSource, selectedVariants]);

	const handleCancel = () => {
		onClose();
		setSelectedVariants([]);
	};

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

		const newReceives = [...(dataSource as any)];
		const indexReceiveItem = newReceives?.findIndex(
			(receive: any) => receive.item_id === item.item_id
		);
		newReceives?.splice(indexReceiveItem, 1, {
			...item,
			quantity: item.quantity + change,
		});
		setDataSource(newReceives as any);
	};

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
				}),
			};
		}
	);

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={isLoading}
			disabled={selectedVariants?.length === 0 || isLoading}
			handleCancel={handleCancel}
			// width={800}
		>
			<Title level={4} className="text-center mb-2">
				{'Nhận trả hàng'}
			</Title>
			<div className="flex flex-col gap-2">
				<Text strong className="font-medium">
					{'Sản phẩm cần nhận'}
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
					// loading={isLoading}
					columns={columns as any}
					dataSource={dataSource ?? []}
					rowKey="item_id"
					pagination={false}
					scroll={{ x: 400 }}
				/>
			</div>
			<div className="mt-2">
				<Text strong className="font-medium">
					{'Đang nhận hàng'}
				</Text>
				<div className="flex flex-col gap-y-2 px-4">
					{dataSource
						?.filter((item: any) => selectedVariants?.includes(item.item_id))
						.map((item: any) => (
							<SummaryLineItem
								key={item.item_id}
								item={item}
								currencyCode={order.currency_code}
							/>
						))}
				</div>
			</div>
			<Divider className="my-2" />
			<div className="font-medium flex w-full justify-between items-center">
				<Text strong className="font-medium">
					{'Tổng tiền hoàn trả'}
				</Text>
				<div className="flex items-center">
					<div className="flex items-center">
						<span
							className="text-gray-400 mr-2 cursor-pointer flex items-center"
							// onClick={() => setRefundEdited(true)}
						>
							<SquareArrowOutUpRight size={16} />
						</span>
						{formatAmountWithSymbol({
							amount: refundAmount || 0,
							currency: order.currency_code,
						})}
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ReceiveReturnModal;

const SummaryLineItem = ({
	item,
	currencyCode,
}: {
	item: any;
	currencyCode: string;
}) => {
	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] mb-1 flex h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item.thumbnail ? (
						<Image
							src={item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${item.product_title}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<div className="flex max-w-[185px] flex-col justify-center text-[12px]">
					<span className="font-normal text-gray-900 truncate">
						{`${item.product_title}`}
					</span>
					<span className="font-normal text-gray-500 truncate">
						{`${item.variant_title}`}
					</span>
				</div>
			</div>
			<div className="flex items-center">
				<div className="md:space-x-2 lg:space-x-4 2xl:space-x-6 mr-3 flex text-[12px]">
					<div className="font-normal text-gray-500">
						{formatAmountWithSymbol({
							amount: item.price,
							currency: currencyCode,
							tax: [],
						})}
					</div>
					<div className="font-normal text-gray-500">x {item.quantity}</div>
					<div className="font-normal text-gray-900 min-w-[55px] text-right">
						{formatAmountWithSymbol({
							amount: item.price * item.quantity || 0,
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
