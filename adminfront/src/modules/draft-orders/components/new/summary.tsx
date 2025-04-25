import { Flex } from '@/components/Flex';
import { Switch } from '@/components/Switch';
import { Tooltip } from '@/components/Tooltip';
import { Text, Title } from '@/components/Typography';
import { SteppedContext } from '@/lib/providers/stepped-modal-provider';
import {
	displayAmount,
	extractOptionPrice,
	formatAmountWithSymbol,
} from '@/utils/prices';
import { Avatar, Button, Table } from 'antd';
import { useAdminShippingOptions } from 'medusa-react';
import Image from 'next/image';
import { useContext, useMemo } from 'react';
import { useNewDraftOrderForm } from '../../hooks/use-new-draft-form';

type Props = {
	setIsSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
};
const Summary: React.FC<Props> = ({ setIsSendEmail }) => {
	const {
		form,
		context: { items, region: regionObj, selectedShippingOption },
	} = useNewDraftOrderForm();

	const shipping = form.getFieldValue('shipping_address');
	const billing = form.getFieldValue('billing_address');
	const region = form.getFieldValue('region');
	const email = form.getFieldValue('email');
	const shippingOption = form.getFieldValue('shipping_option');

	const customShippingPrice = form.getFieldValue('custom_shipping_price');

	const { shipping_options } = useAdminShippingOptions(
		{ region_id: region?.value },
		{
			enabled: !!region && !!shippingOption,
		}
	);

	const shippingOptionPrice = useMemo(() => {
		if (!shippingOption || !shipping_options) {
			return 0;
		}

		const option = shipping_options.find((o) => o.id === shippingOption.value);

		if (!option) {
			return 0;
		}

		return option.amount || 0;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shipping_options, shippingOption]);

	const itemColumns = [
		{
			title: 'Chi tiết',
			dataIndex: 'details',
			key: 'details',
			render: (_: any, record: any) => {
				return (
					<div className="flex min-w-[240px] py-2">
						<div className="h-[40px] w-[30px]">
							{record.thumbnail ? (
								<Image
									className="rounded object-cover"
									src={record.thumbnail}
									alt={record.product_title}
									width={30}
									height={40}
								/>
							) : (
								<div className="h-full w-full bg-gray-200 rounded" />
							)}
						</div>
						<div className="ml-4 flex flex-col">
							<span className="font-medium">{record.product_title}</span>
							<span className="text-gray-500">{record.title}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: 'Số lượng',
			dataIndex: 'quantity',
			key: 'quantity',
			align: 'right',
		},
		{
			title: 'Đơn giá',
			dataIndex: 'unit_price',
			key: 'unit_price',
			align: 'right',
			render: (price: any) => {
				return formatAmountWithSymbol({
					currency: regionObj?.currency_code as string,
					amount: price,
				});
			},
		},
	];

	// Sort items based on the variant product id
	const sortedItems = [...items].sort((a, b) => {
		const productIdA = a.variant_id || '';
		const productIdB = b.variant_id || '';
		return productIdA.localeCompare(productIdB);
	});

	const titleContent =
		'Click để xác nhận gửi thông báo đến khách hàng với thông tin đơn hàng';

	const handleOnChange = (value: boolean) => {
		setIsSendEmail(value);
	};

	const totalQuantity = useMemo(() => {
		return sortedItems.reduce((acc, item) => acc + item.quantity, 0);
	}, [sortedItems]);

	const totalAmount = useMemo(() => {
		return sortedItems.reduce(
			(acc, item) => acc + item.unit_price * item.quantity,
			0
		);
	}, [sortedItems]);

	return (
		<div className="min-h-[705px]">
			<Flex className="flex items-center gap-2">
				<Tooltip title={titleContent}>
					<Text strong>Gửi email:</Text>
				</Tooltip>
				<Switch onChange={handleOnChange} />
			</Flex>
			<SummarySection title="Sản phẩm" editIndex={2}>
				<div className="overflow-auto lg:overflow-visible">
					<Table
						dataSource={sortedItems}
						columns={itemColumns as any}
						pagination={{
							defaultPageSize: 10,
							showSizeChanger: false,
						}}
						rowKey="id"
						summary={() => (
							<>
								<Table.Summary fixed>
									<Table.Summary.Row>
										<Table.Summary.Cell index={0}>
											<span className="font-semibold">Tổng</span>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={1} className="text-right">
											{totalQuantity}
										</Table.Summary.Cell>
										<Table.Summary.Cell index={2} className="text-right">
											{formatAmountWithSymbol({
												currency: regionObj?.currency_code as string,
												amount: totalAmount,
											})}
										</Table.Summary.Cell>
									</Table.Summary.Row>
								</Table.Summary>
							</>
						)}
					/>
				</div>
			</SummarySection>

			<SummarySection title="Khách hàng" editIndex={1}>
				<div className="flex items-center">
					<Avatar className="mr-3" style={{ backgroundColor: '#87d068' }}>
						{shipping?.first_name?.[0] || email?.[0]?.toUpperCase()}
					</Avatar>
					{email}
				</div>
			</SummarySection>

			{selectedShippingOption && (
				<SummarySection title="Chi tiết vận chuyển" editIndex={3}>
					<div className="grid grid-cols-2 gap-6">
						{shipping && (
							<div className="border-r pr-6">
								<div className="text-gray-500">Địa chỉ</div>
								<div>
									{shipping.address_1 || ''}, {shipping.address_2 || ''}
								</div>
								<div>{`${shipping.postal_code || ''} ${shipping.city || ''} ${
									shipping.province || ''
								}`}</div>
							</div>
						)}
						{regionObj && (
							<div>
								<div className="text-gray-500">Phương thức vận chuyển</div>
								<div>
									{selectedShippingOption.name} - {''}
									{customShippingPrice && regionObj ? (
										<span>
											<span className="text-gray-400 line-through mr-2">
												{extractOptionPrice(shippingOptionPrice, regionObj)}
											</span>
											{displayAmount(
												regionObj.currency_code,
												customShippingPrice
											)}
											{regionObj.currency_code.toUpperCase()}
										</span>
									) : (
										extractOptionPrice(
											selectedShippingOption?.amount!,
											regionObj
										)
									)}
								</div>
							</div>
						)}
					</div>
				</SummarySection>
			)}

			{billing && (
				<SummarySection title="Chi tiết thanh toán" editIndex={1}>
					<div className="text-gray-500">Địa chỉ</div>
					<div>
						{billing.address_1 || ''}, {billing.address_2 || ''}
					</div>
					<div>{`${billing.postal_code || ''} ${billing.city || ''} ${
						billing.province || ''
					}`}</div>
				</SummarySection>
			)}
		</div>
	);
};

const SummarySection = ({ title, editIndex, children }: any) => {
	const context = useContext(SteppedContext);
	const setStep = context?.setStep;

	return (
		<div className="mt-4 pb-8 border-b border-gray-200 last:border-b-0">
			<div className="flex justify-between items-center mb-4">
				<Title level={5}>{title}</Title>
				<Button type="link" onClick={() => setStep?.(editIndex)}>
					Sửa
				</Button>
			</div>
			{children}
		</div>
	);
};

export default Summary;
