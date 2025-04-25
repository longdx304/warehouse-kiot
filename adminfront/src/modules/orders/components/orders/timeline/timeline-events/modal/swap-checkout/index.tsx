import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Radio, RadioGroup } from '@/components/Radio';
import { Select } from '@/components/Select';
import { Text, Title } from '@/components/Typography';
import { Option } from '@/types/shared';
import { Order } from '@medusajs/medusa';
import { HandCoins, LoaderCircle } from 'lucide-react';
import {
	useAddShippingMethodToCart,
	useAdminShippingOptions,
	useGetCart,
	useMedusa,
} from 'medusa-react';
import { FC, useState } from 'react';
import paymentProvidersMapper from '@/utils/payment-providers-mapper';
import { message } from 'antd';
import { getErrorMessage } from '@/lib/utils';
type Props = {
	order: Order;
	cartId: string;
	state: boolean;
	onClose: () => void;
	refetch: () => void;
};

const paymentMethods = [
	paymentProvidersMapper('manual'),
	paymentProvidersMapper('stripe'),
];
const SwapCheckoutModal: FC<Props> = ({ order, cartId, state, onClose, refetch }) => {
	const [shippingMethod, setShippingMethod] = useState<Option | null>(null);
	const [paymentOption, setPaymentOption] = useState<Option | null>(null);
	const [shippingPrice, setShippingPrice] = useState<number>(0);
	const [isSubmiting, setIsSubmiting] = useState<boolean>(false);

	const { shipping_options: shippingOptions, isLoading: shippingLoading } =
		useAdminShippingOptions({
			is_return: false,
			region_id: order.region_id,
		});
	const { client } = useMedusa();

	const addShippingMethod = useAddShippingMethodToCart(cartId);

	const handleShippingSelected = (
		selectedItem: string,
		selectOption: Option
	) => {
		if (!shippingOptions) {
			return;
		}

		setShippingMethod(selectOption);
		const method = shippingOptions?.find((o) => selectedItem === o.id);
		setShippingPrice(method?.amount || 0);
	};

	const handlePaymentSelected = (selectedItem: any) => {
		setPaymentOption(selectedItem?.target?.value);
	};

	const onSubmit = async () => {
		setIsSubmiting(true);
		try {
			if (!shippingMethod) {
				message.error('Vui lòng chọn phương thức vận chuyển');
				return;
			}
			if (!paymentOption) {
				message.error('Vui lòng chọn phương thức thanh toán');
				return;
			}
			await addShippingMethod.mutateAsync({
				option_id: shippingMethod?.value,
			});
			await client.carts.createPaymentSessions(cartId, {
				provider_id: paymentOption,
			});
			await client.carts.complete(cartId);
			message.success('Tạo phiên thanh toán thành công');
			refetch();
			onClose();
		} catch (error) {
			message.error(getErrorMessage(error));
			return;
		} finally {
			setIsSubmiting(false);
		}
	};

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={isSubmiting}
			disabled={isSubmiting}
			handleCancel={onClose}
		>
			<Title level={4} className="text-center mb-2">
				{'Tạo phiên thanh toán'}
			</Title>
			<div className="mt-4 flex flex-col">
				<Text strong className="font-medium">
					{'Vận chuyển'}
				</Text>
				<Text className="mb-2">
					{'Chọn phương thức vận chuyển bạn muốn sử dụng cho trả lại này.'}
				</Text>
				{shippingLoading ? (
					<div className="flex justify-center">
						<LoaderCircle size={20} className="animate-spin" />
					</div>
				) : (
					<Select
						className="mt-2"
						placeholder="Chọn phương thức vận chuyển"
						value={shippingMethod?.value}
						onChange={handleShippingSelected as any}
						options={
							shippingOptions?.map((o) => ({
								label: o.name,
								value: o.id,
							})) || []
						}
					/>
				)}
			</div>
			<div className="mt-4 flex flex-col">
				<Text strong className="font-medium">
					{'Phương thức thanh toán'}
				</Text>
				<Text className="mb-2">
					{'Chọn phương thức thanh toán bạn muốn sử dụng cho trả lại này.'}
				</Text>
				{shippingLoading ? (
					<div className="flex justify-center">
						<LoaderCircle size={20} className="animate-spin" />
					</div>
				) : (
					<RadioGroup
						className="w-full flex flex-col justify-start gap-4 pt-4"
						value={paymentOption}
						onChange={handlePaymentSelected as any}
					>
						{paymentMethods?.map((payment: Option) => (
							<Radio
								key={payment.value}
								value={payment.value}
								className="border border-solid border-gray-200 rounded-md px-4 py-2"
							>
								<Flex justify="flex-start" align="center" gap={4}>
									<HandCoins className="text-gray-600" size={24} />
									<Text className="text-[13px]">{payment.label}</Text>
								</Flex>
							</Radio>
						))}
					</RadioGroup>
				)}
			</div>
		</Modal>
	);
};

export default SwapCheckoutModal;
