import { Order } from '@medusajs/medusa';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import { ActionAbles } from '@/components/Dropdown';
import { Ban } from 'lucide-react';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { Empty, Modal as AntdModal, message } from 'antd';
import dayjs from 'dayjs';
import { useAdminCancelOrder } from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';

type Props = {
	order: Order | undefined;
	isLoading: boolean;
};

const Information = ({ order, isLoading }: Props) => {
	const cancelOrder = useAdminCancelOrder(order?.id!);

	const handleCancelOrder = () => {
		AntdModal.confirm({
			title: 'Xác nhận huỷ đơn hàng',
			content: 'Bạn có chắc chắn muốn huỷ đơn hàng này?',
			onOk: async () => {
				await cancelOrder.mutateAsync(undefined, {
					onSuccess: () => {
						message.success('Huỷ đơn hàng thành công');
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			},
		});
	};

	const actions = [
		{
			label: <span className="w-full">{'Huỷ đơn hàng'}</span>,
			key: 'cancel',
			icon: <Ban />,
			danger: true,
			onClick: handleCancelOrder,
		},
	];

	return (
		<Card loading={isLoading} className="px-4">
			{!order && <Empty description="Không tìm thấy đơn hàng" />}
			{order && (
				<div>
					<Flex align="center" justify="space-between" className="pb-2">
						<Title level={4}>{`Đơn hàng #${order?.display_id}`}</Title>
						<div className="flex justify-end items-center gap-4">
							<OrderStatus status={order!.status} />
							<ActionAbles actions={actions} />
						</div>
					</Flex>
					<span className="text-gray-500 text-xs">
						{dayjs(order.created_at).format('hh:mm D/MM/YYYY')}
					</span>
					<Flex vertical gap={4} className="pt-8">
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Email:</Text>
							<Text className="text-gray-500 text-sm">{order.email}</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Điện thoại:</Text>
							<Text className="text-gray-500 text-sm">
								{order?.shipping_address?.phone ??
									order?.customer?.phone ??
									'-'}
							</Text>
						</Flex>
						{/* <Flex justify="space-between" align="center"> */}
						{/* 	<Text className="text-gray-500 text-sm">Thanh toán:</Text> */}
						{/* 	<Text className="text-gray-500 text-sm">{order.email}</Text> */}
						{/* </Flex> */}
					</Flex>
				</div>
			)}
		</Card>
	);
};

export default Information;

const OrderStatus = ({ status }: { status: Order['status'] }) => {
	switch (status) {
		case 'completed':
			return (
				<StatusIndicator
					variant="success"
					title="Đã hoàn thành"
					className="font-normal"
				/>
			);
		case 'pending':
			return (
				<StatusIndicator
					variant="default"
					title="Đang xử lý"
					className="font-normal"
				/>
			);
		case 'canceled':
			return (
				<StatusIndicator
					variant="danger"
					title="Đã huỷ"
					className="font-normal"
				/>
			);
		case 'requires_action':
			return (
				<StatusIndicator
					variant="danger"
					title="Yêu cầu xử lý"
					className="font-normal"
				/>
			);
		default:
			return null;
	}
};
