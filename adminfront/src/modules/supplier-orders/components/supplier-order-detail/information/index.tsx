import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import { useAdminCancelSupplierOrder } from '@/lib/hooks/api/supplier-order';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { SupplierOrder } from '@/types/supplier';
import { Modal as AntdModal, Empty, message } from 'antd';
import dayjs from 'dayjs';
import { Ban, SquarePen } from 'lucide-react';
import InformationModal from './information-modal';

type Props = {
	supplierOrder: SupplierOrder | undefined;
	isLoading: boolean;
};

const Information = ({ supplierOrder, isLoading }: Props) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const cancelOrder = useAdminCancelSupplierOrder(supplierOrder?.id!);

	const isCancelled = supplierOrder?.status === 'canceled';

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
			label: <span className="w-full">{'Chỉnh sửa thông tin'}</span>,
			key: 'detail',
			icon: <SquarePen />,
			onClick: onOpen,
			disabled: isCancelled,
		},
		{
			label: <span className="w-full">{'Huỷ đơn hàng'}</span>,
			key: 'cancel',
			icon: <Ban size={16} />,
			danger: true,
			onClick: handleCancelOrder,
			disabled: isCancelled,
		},
	];

	return (
		<Card loading={isLoading} className="px-4">
			{!supplierOrder && <Empty description="Không tìm thấy đơn hàng" />}
			{supplierOrder && (
				<div>
					<Flex align="center" justify="space-between" className="pb-2">
						<Title level={4}>{`Đơn hàng #${
							supplierOrder?.display_name || supplierOrder?.display_id
						}`}</Title>
						<div className="flex justify-end items-center gap-4">
							<OrderStatus status={supplierOrder!.status as any} />
							<ActionAbles actions={actions} />
						</div>
					</Flex>
					<span className="text-gray-500 text-xs">
						{dayjs(supplierOrder.created_at).format('hh:mm D/MM/YYYY')}
					</span>
					<Flex vertical gap={8} className="pt-6">
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Email:</Text>
							<Text className="text-gray-500 text-sm">
								{supplierOrder?.user?.email}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Điện thoại:</Text>
							<Text className="text-gray-500 text-sm">
								{supplierOrder?.supplier?.phone ?? '-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">
								Ngày hoàn thành dự kiến:
							</Text>
							<Text className="text-gray-500 text-sm">
								{dayjs(supplierOrder?.estimated_production_time).format(
									'DD/MM/YYYY'
								) ?? '-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">
								Ngày thanh toán dự kiến:
							</Text>
							<Text className="text-gray-500 text-sm">
								{dayjs(supplierOrder?.settlement_time).format('DD/MM/YYYY') ??
									'-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">
								Ngày bắt đầu chuyển hàng:
							</Text>
							<Text className="text-gray-500 text-sm">
								{dayjs(supplierOrder?.shipping_started_date).format('DD/MM/YYYY') ??
									'-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">
								Ngày nhập hàng vào kho:
							</Text>
							<Text className="text-gray-500 text-sm">
								{dayjs(supplierOrder?.warehouse_entry_date).format('DD/MM/YYYY') ??
									'-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">
								Ngày tất toán đơn hàng:
							</Text>
							<Text className="text-gray-500 text-sm">
								{dayjs(supplierOrder?.completed_payment_date).format('DD/MM/YYYY') ??
									'-'}
							</Text>
						</Flex>
					</Flex>
				</div>
			)}
			{/* Modal Update */}
			{supplierOrder && (
				<InformationModal
					state={state}
					handleOk={onClose}
					handleCancel={onClose}
					supplierOrder={supplierOrder}
				/>
			)}
		</Card>
	);
};

export default Information;

const OrderStatus = ({ status }: { status: SupplierOrder['status'] }) => {
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

type EditModalProps = {
	state: boolean;
	close: () => void;
};

const ModalEditTimeOrder = ({ state, close }: EditModalProps) => {};
