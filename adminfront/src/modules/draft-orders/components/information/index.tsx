import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { DraftOrder } from '@medusajs/medusa';
import { Modal as AntdModal, Empty, message } from 'antd';
import dayjs from 'dayjs';
import { Ban } from 'lucide-react';
import { useAdminDeleteDraftOrder } from 'medusa-react';

type Props = {
	dorder: DraftOrder | undefined;
	isLoading: boolean;
};

const Information = ({ dorder, isLoading }: Props) => {
	const cancelOrder = useAdminDeleteDraftOrder(dorder?.id!);

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
			{!dorder && <Empty description="Không tìm thấy đơn hàng" />}
			{dorder && (
				<div>
					<Flex align="center" justify="space-between" className="pb-2">
						<Title level={4}>{`Đơn hàng #${dorder?.display_id}`}</Title>
						<div className="flex justify-end items-center gap-4">
							<OrderStatus status={dorder!.status} />
							<ActionAbles actions={actions} />
						</div>
					</Flex>
					<span className="text-gray-500 text-xs">
						{dayjs(dorder.created_at).format('hh:mm D/MM/YYYY')}
					</span>
					<Flex vertical gap={4} className="pt-8">
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Email:</Text>
							<Text className="text-gray-500 text-sm">
								{dorder.cart?.email}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Điện thoại:</Text>
							<Text className="text-gray-500 text-sm">
								{dorder?.cart?.shipping_address?.phone ??
									dorder?.cart?.customer?.phone ??
									'-'}
							</Text>
						</Flex>
					</Flex>
				</div>
			)}
		</Card>
	);
};

export default Information;

const OrderStatus = ({ status }: { status: DraftOrder['status'] }) => {
	switch (status) {
		case 'open':
			return (
				<StatusIndicator
					variant="default"
					title="Đang xử lý"
					className="font-normal"
				/>
			);
		case 'completed':
			return (
				<StatusIndicator
					variant="success"
					title="Đã hoàn thành"
					className="font-normal"
				/>
			);

		default:
			return null;
	}
};
