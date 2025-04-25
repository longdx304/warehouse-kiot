import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { AddressType } from '@/types/order';
import { Address, DraftOrder } from '@medusajs/medusa';
import { Empty } from 'antd';
import { CircleDollarSign, Truck } from 'lucide-react';
import { useAdminRegion } from 'medusa-react';
import { useState } from 'react';
import AddressModal from './address-modal';

type Props = {
	dorder: DraftOrder | undefined;
	isLoading: boolean;
};

const CustomerInfo = ({ dorder, isLoading }: Props) => {
	const [addressModal, setAddressModal] = useState<null | {
		address?: Address | null;
		type: AddressType;
	}>(null);

	const { region } = useAdminRegion(dorder?.cart?.region_id!, {
		enabled: !!dorder?.cart?.region_id,
	});

	const {
		state: addressModalState,
		onClose: closeAddressModal,
		onOpen: openAddressModal,
	} = useToggleState();

	const actions = [
		{
			label: <span className="w-full">{'Chỉnh sửa địa chỉ giao hàng'}</span>,
			key: 'edit-address',
			icon: <Truck />,
			onClick: () => {
				setAddressModal({
					address: dorder?.cart?.shipping_address,
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
					address: dorder?.cart?.billing_address,
					type: AddressType.BILLING,
				});
				openAddressModal();
			},
		},
	];

	return (
		<Card loading={isLoading} className="px-4">
			{!dorder && <Empty description="Không tìm thấy đơn hàng" />}
			{dorder && (
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
							<Text className="text-gray-500 text-sm">
								{dorder.cart?.email}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Liên hệ:</Text>
							<Text className="text-gray-500 text-sm">
								{dorder?.cart?.shipping_address?.phone ??
									dorder?.cart?.customer?.phone ??
									'-'}
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Vận chuyển:</Text>
							<Text className="text-gray-500 text-sm">
								<div className="font-normal flex flex-col items-end">
									<span>
										{dorder.cart?.shipping_address?.address_1}{' '}
										{dorder.cart?.shipping_address?.address_2}
									</span>
									<span>
										{dorder.cart?.shipping_address?.postal_code}{' '}
										{dorder.cart?.shipping_address?.city}
										{', '}
										{dorder.cart?.shipping_address?.province
											? `${dorder.cart?.shipping_address.province} `
											: ''}
										{dorder.cart?.shipping_address?.country_code?.toUpperCase()}
									</span>
								</div>
							</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text className="text-gray-500 text-sm">Thanh toán:</Text>
							<Text className="text-gray-500 text-sm">
								<div className="font-normal flex flex-col items-end">
									<span>
										{dorder.cart?.billing_address?.address_1}{' '}
										{dorder.cart?.billing_address?.address_2}
									</span>
									<span>
										{dorder.cart?.billing_address?.postal_code}{' '}
										{dorder.cart?.billing_address?.city}
										{', '}
										{dorder.cart?.billing_address?.province
											? `${dorder.cart?.billing_address.province} `
											: ''}
										{dorder.cart?.billing_address?.country_code?.toUpperCase()}
									</span>
								</div>
							</Text>
						</Flex>
					</Flex>
				</div>
			)}

			<AddressModal
				onClose={closeAddressModal}
				open={addressModalState}
				address={addressModal?.address || undefined}
				type={addressModal?.type as AddressType}
				allowedCountries={region?.countries}
				orderId={dorder?.id as string}
			/>
		</Card>
	);
};

export default CustomerInfo;
