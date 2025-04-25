import { LineItem, OrderEdit, OrderItemChange } from '@medusajs/medusa';
import {
	useAdminCancelOrderEdit,
	useAdminConfirmOrderEdit,
	useAdminDeleteOrderEdit,
	useAdminUser,
} from 'medusa-react';
import React from 'react';
import { SquarePen } from 'lucide-react';

import { OrderEditEvent } from '@/modules/orders/hooks/use-build-timeline';
import { getErrorMessage } from '@/lib/utils';
import { message, Popconfirm } from 'antd';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import EventContainer from '../event-container';
import { ByLine } from '.';
import { useOrderEdit } from '@/modules/orders/components/orders/edit-order-modal/context';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Tooltip } from '@/components/Tooltip';

type EditCreatedProps = {
	event: OrderEditEvent;
	refetchOrder: () => void;
};

enum OrderEditItemChangeType {
	ITEM_ADD = 'item_add',
	ITEM_REMOVE = 'item_remove',
	ITEM_UPDATE = 'item_update',
}

const getInfo = (edit: OrderEdit): { type: string; user_id: string } => {
	if (edit.requested_at && edit.requested_by) {
		return {
			type: 'requested',
			user_id: edit.requested_by,
		};
	}
	return {
		type: 'created',
		user_id: edit.created_by,
	};
};

const EditCreated: React.FC<EditCreatedProps> = ({ event, refetchOrder }) => {
	const { isModalVisible, showModal, setActiveOrderEditId } = useOrderEdit();

	const orderEdit = event.edit;

	const { type, user_id } = getInfo(orderEdit);

	const name = `${
		type === 'created'
			? 'Đã tạo chỉnh sửa đơn hàng'
			: 'Yêu cầu chỉnh sửa đơn hàng'
	}`;

	const { user } = useAdminUser(user_id);

	const deleteOrderEdit = useAdminDeleteOrderEdit(orderEdit.id);
	const cancelOrderEdit = useAdminCancelOrderEdit(orderEdit.id);
	const confirmOrderEdit = useAdminConfirmOrderEdit(orderEdit.id);

	const onDeleteOrderEditClicked = () => {
		deleteOrderEdit.mutateAsync(undefined, {
			onSuccess: () => {
				message.success('Xoá thành công yêu cầu chỉnh sửa đơn hàng');
			},
			onError: (err) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const onCancelOrderEditClicked = () => {
		cancelOrderEdit.mutateAsync(undefined, {
			onSuccess: () => {
				message.success('Đã huỷ thành công yêu cầu chỉnh sửa đơn hàng');
			},
			onError: (err) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const onConfirmEditClicked = async () => {
		await confirmOrderEdit.mutateAsync(undefined, {
			onSuccess: () => {
				message.success('Xác nhận chỉnh sửa đơn hàng thành công');
				refetchOrder();
			},
			onError: (err) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const onCopyConfirmationLinkClicked = () => {
		console.log('TODO');
	};

	const onContinueEdit = () => {
		setActiveOrderEditId(orderEdit.id);
		showModal();
	};

	// hide last created edit while editing and prevent content flashing while loading
	if (isModalVisible && orderEdit?.status === 'created') {
		return null;
	}

	return (
		<>
			<EventContainer
				title={name}
				icon={<SquarePen size={20} />}
				time={event.time}
				isFirst={event.first}
				midNode={<ByLine user={user} />}
			>
				{orderEdit.internal_note && (
					<div className="px-4 py-2 mt-2 mb-6 rounded-lg bg-gray-100 font-normal text-gray-900">
						{orderEdit.internal_note}
					</div>
				)}
				<div className="mb-4">
					<OrderEditChanges
						orderEdit={orderEdit}
						currencyCode={event.currency_code}
						taxRate={event.taxRate}
					/>
				</div>
				{(orderEdit.status === 'created' ||
					orderEdit.status === 'requested') && (
					<div className="space-y-xsmall mt-large">
						{type === 'created' ? (
							<Flex vertical gap="small">
								<Button
									className="w-full font-medium"
									size="small"
									type="default"
									onClick={onContinueEdit}
								>
									Tiếp tục
								</Button>
								<Popconfirm
									title="Xoá chỉnh sửa đơn hàng"
									description="Bạn có chắc chắn muốn xoá chỉnh sửa đơn hàng này?"
									onConfirm={onDeleteOrderEditClicked}
									// onCancel={cancel}
									okText="Xác nhận"
									cancelText="Huy"
								>
									<Button
										danger
										className="w-full font-medium"
										size="small"
										type="default"
									>
										Xoá
									</Button>
								</Popconfirm>
							</Flex>
						) : (
							<Flex vertical gap="small">
								<Button
									className="w-full font-medium"
									type="default"
									onClick={onConfirmEditClicked}
								>
									Xác nhận
								</Button>

								<Popconfirm
									title="Huỷ chỉnh sửa đơn hàng"
									description="Bạn có chắc chắn muốn huỷ chỉnh sửa đơn hàng này?"
									onConfirm={onCancelOrderEditClicked}
									// onCancel={cancel}
									okText="Xác nhận"
									cancelText="Huỷ"
								>
									<Button
										danger
										className="w-full font-medium"
										size="small"
										type="default"
									>
										Huỷ
									</Button>
								</Popconfirm>
							</Flex>
						)}
					</div>
				)}
			</EventContainer>
		</>
	);
};

const OrderEditChanges = ({ orderEdit, taxRate, currencyCode }: any) => {
	if (!orderEdit) {
		return <></>;
	}
	const added = orderEdit.changes.filter(
		(oec: OrderItemChange) =>
			oec.type === OrderEditItemChangeType.ITEM_ADD ||
			(oec.type === OrderEditItemChangeType.ITEM_UPDATE &&
				oec.line_item &&
				oec.original_line_item &&
				oec.original_line_item.quantity < oec.line_item.quantity)
	);

	const removed = orderEdit.changes.filter(
		(oec: OrderItemChange) =>
			oec.type === OrderEditItemChangeType.ITEM_REMOVE ||
			(oec.type === OrderEditItemChangeType.ITEM_UPDATE &&
				oec.line_item &&
				oec.original_line_item &&
				oec.original_line_item.quantity > oec.line_item.quantity)
	);

	const updatedPrice = orderEdit.changes.filter(
		(oec: OrderItemChange) =>
			oec.type === OrderEditItemChangeType.ITEM_UPDATE &&
			oec.line_item &&
			oec.original_line_item &&
			oec.original_line_item.unit_price !== oec.line_item.unit_price
	);

	return (
		<div className="gap-y-4 flex flex-col">
			{added.length > 0 && (
				<div className="flex flex-col gap-y-2">
					<span className="font-normal text-gray-500">Đã thêm:</span>
					{added.map((change: any) => (
						<OrderEditChangeItem change={change} key={change.id} />
					))}
				</div>
			)}
			{removed.length > 0 && (
				<div>
					<span className="font-normal text-gray-500">Đã xoá:</span>
					{removed.map((change: any) => (
						<OrderEditChangeItem change={change} key={change.id} />
					))}
				</div>
			)}
			{updatedPrice.length > 0 && (
				<div>
					<span className="font-normal text-gray-500">Thay đổi:</span>
					{updatedPrice.map((change: any) => (
						<OrderEditChangeItem
							change={change}
							key={change.id}
							isUpdated
							taxRate={taxRate}
							currencyCode={currencyCode}
						/>
					))}
				</div>
			)}
		</div>
	);
};

type OrderEditChangeItemProps = {
	change: OrderItemChange;
	isUpdated?: boolean;
	taxRate?: number;
	currencyCode?: string;
};

const OrderEditChangeItem: React.FC<OrderEditChangeItemProps> = ({
	change,
	isUpdated = false,
	taxRate = 0,
	currencyCode,
}) => {
	let quantity;
	const isAdd = change.type === OrderEditItemChangeType.ITEM_ADD;

	if (isAdd) {
		quantity = (change.line_item as LineItem).quantity;
	} else {
		quantity =
			(change.original_line_item as LineItem)?.quantity -
			(change.line_item as LineItem)?.quantity;
	}

	quantity = Math.abs(quantity);

	const lineItem = isAdd ? change.line_item : change.original_line_item;
	const tooltipContent = `${lineItem?.title} - ${lineItem?.variant?.title} (${
		lineItem?.variant?.sku || ''
	})`;

	return (
		<div className="gap-x-4 flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div className="rounded-md flex h-[40px] w-[30px] overflow-hidden">
					{lineItem?.thumbnail ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={lineItem.thumbnail} className="object-cover" alt="" />
					) : (
						<PlaceholderImage />
					)}
				</div>
				<Tooltip title={tooltipContent}>
					<div className="flex flex-col max-w-[185px]">
						<span className="font-medium text-gray-900 truncate">
							{!isUpdated && quantity > 1 && <>{`${quantity} x `}</>}{' '}
							{lineItem?.title} &nbsp;
							{lineItem?.variant?.sku && (
								<span className="text-xs truncate">
									{lineItem?.variant?.sku}
								</span>
							)}
						</span>
						<span className="font-normal text-gray-500 flex truncate max-w-[185px]">
							{`${lineItem?.variant.title}${
								lineItem?.variant.sku ? ` (${lineItem.variant.sku})` : ''
							}`}
						</span>
					</div>
				</Tooltip>
			</div>
			{isUpdated && (
				<div className="flex flex-col">
					{change.original_line_item && (
						<div className="text-gray-500 line-through">
							{formatAmountWithSymbol({
								amount: Math.round(
									change.original_line_item.unit_price * (1 + taxRate / 100)
								),
								currency: currencyCode ?? 'VND',
							})}
						</div>
					)}
					{change.line_item && (
						<div className="text-gray-500">
							{formatAmountWithSymbol({
								amount: Math.round(
									change.line_item.unit_price * (1 + taxRate / 100)
								),
								currency: currencyCode ?? 'VND',
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default EditCreated;
