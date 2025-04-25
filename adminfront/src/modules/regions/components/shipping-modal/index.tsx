import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { ShippingOption } from '@medusajs/medusa';
import { Modal as AntdModal, message } from 'antd';
import { useAdminShippingOptions, useMedusa } from 'medusa-react';
import { FC, useMemo, useState } from 'react';
import ReturnShippingOptionModal from './return-shipping-option';
import shippingColumns from './shipping-columns';
import ShippingOptionModal from './shipping-option';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	regionId: string;
};

const PAGE_SIZE = 10;
const ShippingModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	regionId,
}) => {
	const [currentShipping, setCurrentShipping] = useState<ShippingOption | null>(
		null
	);

	const [currentReturnShipping, setCurrentReturnShipping] =
		useState<ShippingOption | null>(null);
	const { client } = useMedusa();
	const {
		state: stateActionShipping,
		onOpen: onOpenActionShipping,
		onClose: onCloseActionShipping,
	} = useToggleState(false);

	const {
		state: stateActionReturnShipping,
		onOpen: onOpenActionReturnShipping,
		onClose: onCloseActionReturnShipping,
	} = useToggleState(false);
	// Shipping
	const {
		shipping_options: shippingOptions,
		isLoading: isLoadingShipping,
		refetch: refetchShipping,
	} = useAdminShippingOptions({
		region_id: regionId,
		is_return: false,
	});

	// Return Shipping
	const {
		shipping_options: returnShippingOptions,
		isLoading: isLoadingReturnShipping,
		refetch: refetchReturnShipping,
	} = useAdminShippingOptions({
		region_id: regionId,
		is_return: true,
	});

	const handleEditShipping = (record: ShippingOption) => {
		setCurrentShipping(record);
		onOpenActionShipping();
	};

	const handleDeleteShipping = (recordId: ShippingOption['id']) => {
		AntdModal.confirm({
			title: 'Xác nhận xóa tùy chọn vận chuyển này',
			content: 'Bạn có chắc chắn muốn xóa vận chuyển này?',
			onOk: async () => {
				await client.admin.shippingOptions
					.delete(recordId)
					.then(() => {
						message.success('Xóa vận chuyển thành công');
						refetchShipping();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
	};

	const handleEditReturnShipping = (record: ShippingOption) => {
		setCurrentReturnShipping(record);
		onOpenActionReturnShipping();
	};

	const handleDeleteReturnShipping = (recordId: ShippingOption['id']) => {
		AntdModal.confirm({
			title: 'Xác nhận xóa giao hàng trả lại này',
			content: 'Bạn có chắc chắn muốn xóa giao hàng trả lại này?',
			onOk: async () => {
				await client.admin.shippingOptions
					.delete(recordId)
					.then(() => {
						message.success('Xóa vận chuyển thành công');
						refetchReturnShipping();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
	};

	const tableShippingColumns = useMemo(
		() =>
			shippingColumns({
				handleEdit: handleEditShipping,
				handleDelete: handleDeleteShipping,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[shippingOptions]
	);

	const tableReturnShippingColumns = useMemo(
		() =>
			shippingColumns({
				handleEdit: handleEditReturnShipping,
				handleDelete: handleDeleteReturnShipping,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[returnShippingOptions]
	);

	return (
		<>
			{/* Main Modal Shipping */}
			<Modal
				open={state}
				handleOk={handleOk}
				handleCancel={handleCancel}
				width={800}
			>
				<Title level={3} className="pb-4">
					Vận chuyển
				</Title>
				<Flex justify="space-between" align="center" className="pb-4">
					<Title level={5}>Tuỳ chọn vận chuyển</Title>
					<Button type="default" onClick={onOpenActionShipping}>
						Thêm tuỳ chọn
					</Button>
				</Flex>
				<Table
					columns={tableShippingColumns as any}
					dataSource={shippingOptions ?? []}
					loading={isLoadingShipping}
					rowKey="id"
					pagination={false}
				/>
				<Flex justify="space-between" align="center" className="py-4">
					<Title level={5}>Tuỳ chọn giao hàng trả lại</Title>
					<Button type="default" onClick={onOpenActionReturnShipping}>
						Thêm tuỳ chọn
					</Button>
				</Flex>
				<Table
					columns={tableReturnShippingColumns as any}
					dataSource={returnShippingOptions ?? []}
					loading={isLoadingReturnShipping}
					rowKey="id"
					pagination={false}
				/>
			</Modal>

			{/* Action Modal Shipping */}
			<ShippingOptionModal
				state={stateActionShipping}
				handleOk={() => {
					onCloseActionShipping();
					setCurrentShipping(null);
				}}
				handleCancel={() => {
					onCloseActionShipping();
					setCurrentShipping(null);
				}}
				regionId={regionId}
				shippingOption={currentShipping!}
			/>

			{/* Action Modal Return Shipping */}
			<ReturnShippingOptionModal
				state={stateActionReturnShipping}
				handleOk={() => {
					onCloseActionReturnShipping();
					setCurrentReturnShipping(null);
				}}
				handleCancel={() => {
					onCloseActionReturnShipping();
					setCurrentReturnShipping(null);
				}}
				regionId={regionId}
				returnShippingOption={currentReturnShipping!}
			/>
		</>
	);
};

export default ShippingModal;
