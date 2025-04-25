import { LineItem, OrderEdit, OrderItemChange } from '@medusajs/medusa';
import { SquarePen } from 'lucide-react';
import { useAdminUser } from 'medusa-react';
import React from 'react';

import { getErrorMessage } from '@/lib/utils';
import { OrderEditEvent } from '@/modules/orders/hooks/use-build-timeline';
import { message, Popconfirm } from 'antd';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { useOrderEdit } from '@/modules/orders/components/orders/edit-order-modal/context';
import { Tooltip } from '@/components/Tooltip';
import {
	useAdminCancelSupplierOrderEdit,
	useAdminConfirmSupplierOrderEdit,
	useAdminDeleteSupplierOrderEdit,
} from '@/lib/hooks/api/supplier-order-edits';

import { ByLine } from '.';
import EventContainer from '../event-container';
type EditCreatedProps = {
	event: OrderEditEvent;
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

const EditCreated: React.FC<EditCreatedProps> = ({ event }) => {
	const { isModalVisible, showModal, setActiveOrderEditId } = useOrderEdit();

	const orderEdit = event.edit;

	const { type, user_id } = getInfo(orderEdit);

	const name = `${
		type === 'created'
			? 'Đã tạo chỉnh sửa đơn hàng'
			: 'Yêu cầu chỉnh sửa đơn hàng'
	}`;

	const { user } = useAdminUser(user_id);

	const deleteOrderEdit = useAdminDeleteSupplierOrderEdit(orderEdit.id);
	const cancelOrderEdit = useAdminCancelSupplierOrderEdit(orderEdit.id);
	const confirmOrderEdit = useAdminConfirmSupplierOrderEdit(orderEdit.id);

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
		console.log('TODO');
		await confirmOrderEdit.mutateAsync(undefined, {
			onSuccess: () => {
				message.success('Xác nhận chỉnh sửa đơn hàng thành công');

				// updatedSupplierOrder.refetch();
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
					<OrderEditChanges orderEdit={orderEdit} />
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
									cancelText="Huy"
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

const OrderEditChanges = ({ orderEdit }: any) => {
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
		(oec: any) =>
			oec.type === OrderEditItemChangeType.ITEM_REMOVE ||
			(oec.type === OrderEditItemChangeType.ITEM_UPDATE &&
				oec.line_item &&
				oec.original_line_item &&
				oec.original_line_item.quantity > oec.line_item.quantity)
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
		</div>
	);
};

type OrderEditChangeItemProps = {
	change: OrderItemChange;
};

const OrderEditChangeItem: React.FC<OrderEditChangeItemProps> = ({
	change,
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
		<div className="gap-x-4 flex">
			<div>
				<div className="rounded-md flex h-[40px] w-[30px] overflow-hidden">
					{lineItem?.thumbnail ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={lineItem.thumbnail} className="object-cover" alt="" />
					) : (
						<PlaceholderImage />
					)}
				</div>
			</div>
			<Tooltip title={tooltipContent}>
				<span className="font-medium text-gray-900">
					{quantity > 1 && <>{`${quantity} x `}</>} {lineItem?.title} &nbsp;
				</span>
			</Tooltip>
		</div>
	);
};

export default EditCreated;
