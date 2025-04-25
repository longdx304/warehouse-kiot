import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { AddressType } from '@/types/order';
import { Address, Order } from '@medusajs/medusa';
import { Empty } from 'antd';
import {
	CircleDollarSign,
	Contact,
	Mail,
	RefreshCw,
	Truck,
} from 'lucide-react';
import { useAdminRegion } from 'medusa-react';
import { useState } from 'react';
import AddressModal from './address-modal';
import EmailModal from './email-modal';
import TransferOrdersModal from './transfer-order-modal';

type Props = {
	order: Order | undefined;
	isLoading: boolean;
};

const CustomerInfo = ({ order, isLoading }: Props) => {
	const [addressModal, setAddressModal] = useState<null | {
		address?: Address | null;
		type: AddressType;
	}>(null);
	const [emailModal, setEmailModal] = useState<null | {
		email: string;
	}>(null);

	const { region } = useAdminRegion(order?.region_id!, {
		enabled: !!order?.region_id,
	});

	const {
		state: showTransferOrderModal,
		onOpen: openTransferOrderModal,
		onClose: closeTransferOrderModal,
	} = useToggleState();
	const {
		state: showEmailModal,
		onOpen: openEmailModal,
		onClose: closeEmailModal,
	} = useToggleState();
	const {
		state: addressModalState,
		onClose: closeAddressModal,
		onOpen: openAddressModal,
	} = useToggleState();

	const actions = [
		{
			label: <span className="w-full">{'Chuyển đến khách hàng'}</span>,
			key: 'move-in',
			icon: <Contact />,
			onClick: () => {},
		},
		{
			label: <span className="w-full">{'Chuyển quyền sở hữu'}</span>,
			key: 'swap',
			icon: <RefreshCw />,
			onClick: () => openTransferOrderModal(),
		},
		{
			label: <span className="w-full">{'Chỉnh sửa địa chỉ giao hàng'}</span>,
			key: 'edit-address',
			icon: <Truck />,
			onClick: () => {
				setAddressModal({
					address: order?.shipping_address,
					type: AddressType.SHIPPING,
				});
				openAddressModal();
			},
		},
		{
			label: <span className="w-full">{'Chỉnh sửa địa chỉ thanh toán'}</span>,
			key: 'edit-payment-address',
			icon: <CircleDollarSign />,
			onClick: () => {
				setAddressModal({
					address: order?.billing_address,
					type: AddressType.BILLING,
				});
				openAddressModal();
			},
		},
		{
			label: <span className="w-full">{'Chỉnh sửa địa chỉ email'}</span>,
			key: 'edit-email',
			icon: <Mail />,
			onClick: () => {
				setEmailModal({ email: order?.email ?? '' });
				openEmailModal();
			},
		},
	];

	return (
		<Card loading={isLoading} className="px-4">
			{!order && <Empty description="Không tìm thấy đơn hàng" />}
			{order && (
				<div className="">
					<Flex align="center" justify="space-between" className="pb-2">
						<Title level={4}>{`Khách hàng`}</Title>
						<div className="flex justify-end items-center gap-4">
							<ActionAbles actions={actions} />
						</div>
					</Flex>
					<Flex vertical gap={4} className="pt-8">
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Email:</Text>
							<Text className="text-gray-500 text-sm">{order.email}</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Liên hệ:</Text>
							<Text className="text-gray-500 text-sm">
								{order?.shipping_address?.phone ??
									order?.customer?.phone ??
									'-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Vận chuyển:</Text>
							<Text className="text-gray-500 text-sm">
								<div className="font-normal flex flex-col items-end">
									<span>
										{order.shipping_address?.address_1}{' '}
										{order.shipping_address?.address_2}
									</span>
									<span>
										{order.shipping_address?.postal_code}{' '}
										{order.shipping_address?.city}
										{', '}
										{order.shipping_address?.province
											? `${order.shipping_address.province} `
											: ''}
										{order.shipping_address?.country_code?.toUpperCase()}
									</span>
								</div>
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Thanh toán:</Text>
							<Text className="text-gray-500 text-sm">
								<div className="font-normal flex flex-col items-end">
									<span>
										{order.billing_address?.address_1}{' '}
										{order.billing_address?.address_2}
									</span>
									<span>
										{order.billing_address?.postal_code}{' '}
										{order.billing_address?.city}
										{', '}
										{order.billing_address?.province
											? `${order.billing_address.province} `
											: ''}
										{order.billing_address?.country_code?.toUpperCase()}
									</span>
								</div>
							</Text>
						</Flex>
					</Flex>
				</div>
			)}
			<TransferOrdersModal
				state={showTransferOrderModal}
				handleOk={closeTransferOrderModal}
				handleCancel={closeTransferOrderModal}
				order={order as Order}
			/>
			{emailModal && (
				<EmailModal
					email={emailModal?.email}
					orderId={order?.id as string}
					state={showEmailModal}
					handleOk={closeEmailModal}
					handleCancel={closeEmailModal}
				/>
			)}

			<AddressModal
				onClose={closeAddressModal}
				open={addressModalState}
				address={addressModal?.address || undefined}
				type={addressModal?.type as AddressType}
				allowedCountries={region?.countries}
				orderId={order?.id as string}
			/>
		</Card>
	);
};

export default CustomerInfo;
