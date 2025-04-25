import { Button } from '@/components/Button';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { ReturnEvent } from '@/modules/orders/hooks/use-build-timeline';
import { message, Modal } from 'antd';
import clsx from 'clsx';
import { Ban, CircleAlert, PackageCheck, Trash2 } from 'lucide-react';
import { useAdminCancelReturn } from 'medusa-react';
import React from 'react';

import EventActionables from './event-actionables';
import EventContainer from './event-container';
import EventItemContainer from './event-item-container';
import ReceiveReturnModal from './modal/receive-return';
import { getErrorMessage } from '@/lib/utils';

type ReturnRequestedProps = {
	event: ReturnEvent;
	refetch: () => void;
	refetchOrder: () => void;
};

const Return: React.FC<ReturnRequestedProps> = ({ event, refetch, refetchOrder }) => {
	const cancelReturn = useAdminCancelReturn(event.id);

	const { state, onClose, onOpen } = useToggleState(false);

	const handleCancel = () => {
		Modal.confirm({
			title: 'Bạn có muốn huỷ yêu cầu trả hàng ?',
			content:
				'Yêu cầu trả hàng sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn thực hiện chứ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				cancelReturn.mutateAsync(event.id as any, {
					onSuccess: () => {
						refetch();
						message.success('Huỷ trả hàng thành công!');
						return;
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
						return;
					},
				});
			},
		});
		// cancelReturn.mutate(undefined, {
		//   onSuccess: () => {
		//     refetch()
		//   },
		// })
	};

	const eventContainerArgs = buildReturn(event, handleCancel, onOpen);

	if (event.raw?.claim_order_id) {
		return null;
	}

	return (
		<>
			<EventContainer {...eventContainerArgs} />
			{state && (
				<ReceiveReturnModal
					onClose={onClose}
					order={event.order}
					returnRequest={event.raw}
					state={state}
					refetchOrder={refetchOrder}
				/>
			)}
		</>
	);
};

function buildReturn(
	event: ReturnEvent,
	onCancel: () => void,
	onReceive: () => void
) {
	let title: string = '';
	let icon: React.ReactNode;
	let button: React.ReactNode;
	const actions: any[] = [];

	switch (event.status) {
		case 'requested':
			title = 'Yêu cầu trả lại';
			icon = <CircleAlert size={20} className="text-orange-400" />;
			if (event.currentStatus === 'requested') {
				button = event.currentStatus && event.currentStatus === 'requested' && (
					<Button
						type="default"
						className={clsx('mt-large w-full')}
						onClick={onReceive}
					>
						Nhận hàng trả lại
					</Button>
				);
				actions.push({
					icon: <Trash2 size={20} />,
					label: 'Huỷ yêu cầu',
					danger: true,
					onClick: onCancel,
				});
			}
			break;
		case 'received':
			title = 'Đã nhận hàng trả lại';
			icon = <PackageCheck size={20} className="text-emerald-400" />;
			break;
		case 'canceled':
			title = 'Đã hủy yêu cầu trả lại';
			icon = <Ban size={20} className="text-gray-500" />;
			break;
		case 'requires_action':
			title = 'Yêu cầu trả lại cần thực hiện';
			icon = <CircleAlert size={20} className="text-rose-500" />;
			break;
		default:
			break;
	}

	return {
		title,
		icon,
		time: event.time,
		topNode: actions.length > 0 && <EventActionables actions={actions} />,
		noNotification: event.noNotification,
		children:
			event.status === 'requested'
				? [
						event.items.map((i, index) => {
							return <EventItemContainer key={index} item={i} />;
						}),
						React.createElement(React.Fragment, { key: 'button' }, button),
				  ]
				: event.status === 'received'
				? [
						event.items.map((i, index) => (
							<EventItemContainer
								key={index}
								item={{ ...i, quantity: i.receivedQuantity ?? i.quantity }}
							/>
						)),
				  ]
				: null,
	};
}

export default Return;
