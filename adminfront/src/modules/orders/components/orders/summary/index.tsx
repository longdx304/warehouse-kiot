import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Pagination } from '@/components/Pagination';
import { Title } from '@/components/Typography';
import {
	DisplayTotal,
	DisplayTotalQuantity,
	PaymentDetails,
} from '@/modules/orders/components/common';
import { useOrderEdit } from '@/modules/orders/components/orders/edit-order-modal/context';
import { Order } from '@medusajs/medusa';
import { ReservationItemDTO } from '@medusajs/types';
import { Divider, Empty } from 'antd';
import _ from 'lodash';
import { Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import OrderLine from './order-line';

type Props = {
	order: Order | undefined;
	isLoading: boolean;
	// inventoryEnabled?: boolean;
	reservations: ReservationItemDTO[];
	refetch?: () => void;
};

const PAGE_SIZE = 10;
const Summary = ({
	order,
	isLoading,
	// inventoryEnabled = false,
	reservations = [],
	refetch,
}: Props) => {
	const { showModal } = useOrderEdit();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);
	const [searchValue, setSearchValue] = useState('');

	const reservationItemsMap = useMemo(() => {
		if (!reservations?.length) {
			return {};
		}

		return reservations.reduce(
			(acc: Record<string, ReservationItemDTO[]>, item: ReservationItemDTO) => {
				if (!item.line_item_id) {
					return acc;
				}
				acc[item.line_item_id] = acc[item.line_item_id]
					? [...acc[item.line_item_id], item]
					: [item];
				return acc;
			},
			{}
		);
	}, [reservations]);

	const { hasMovements, swapAmount, manualRefund, swapRefund, returnRefund } =
		useMemo(() => {
			let manualRefund = 0;
			let swapRefund = 0;
			let returnRefund = 0;

			const swapAmount = _.sum(
				order?.swaps.map((s) => s.difference_due) || [0]
			);

			if (order?.refunds?.length) {
				order.refunds.forEach((ref) => {
					if (ref.reason === 'other' || ref.reason === 'discount') {
						manualRefund += ref.amount;
					}
					if (ref.reason === 'return') {
						returnRefund += ref.amount;
					}
					if (ref.reason === 'swap') {
						swapRefund += ref.amount;
					}
				});
			}
			return {
				hasMovements:
					swapAmount + manualRefund + swapRefund + returnRefund !== 0,
				swapAmount,
				manualRefund,
				swapRefund,
				returnRefund,
			};
		}, [order]);

	const actions = useMemo(() => {
		const actionAbles = [];
		actionAbles.push({
			label: <span>{'Chỉnh sửa đơn hàng'}</span>,
			icon: <Pencil size={16} />,
			onClick: () => {
				showModal();
			},
		});
		// }
		return actionAbles;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!order) {
		return (
			<Card loading={isLoading}>
				<Empty description="Chưa có đơn hàng" />
			</Card>
		);
	}

	const isAllocatable = !['canceled', 'archived'].includes(order.status);

	const totalQuantity = order.items.reduce(
		(acc, item) => acc + item.quantity,
		0
	);

	// Filter items based on the search term
	const filteredItems = order.items.filter(
		(item) =>
			item.variant?.product_id
				?.toLowerCase()
				.includes(searchValue.toLowerCase()) ||
			item.title?.toLowerCase().includes(searchValue?.toLowerCase()) ||
			item.variant?.title?.toLowerCase().includes(searchValue?.toLowerCase()) ||
			item.variant?.sku?.toLowerCase().includes(searchValue?.toLowerCase())
	);

	// Sort items based on the variant product id
	const sortedItems = [...filteredItems].sort((a, b) => {
		const productIdA = a.variant?.product_id || '';
		const productIdB = b.variant?.product_id || '';
		return productIdA.localeCompare(productIdB);
	});

	// Paginated items
	const startIndex = (currentPage - 1) * pageSize;
	const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

	// Search items
	const handleChangeDebounce = _.debounce(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setCurrentPage(1);
			setSearchValue(e.target.value);
			setPageSize(PAGE_SIZE);
		},
		1000
	);

	return (
		<Card loading={isLoading} className="px-4">
			<div>
				<Flex align="center" justify="space-between" className="pb-2">
					<Title level={4}>{`Tổng quan`}</Title>
					{/* <Button type="default" onClick={openEdit}>{'Chỉnh sửa đơn hàng'}</Button> */}
					<ActionAbles actions={actions as any} />
				</Flex>
			</div>
			<div>
				<Flex align="center" justify="flex-end" className="pb-4">
					<Input
						placeholder="Tên sản phẩm..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				{paginatedItems.length > 0 ? (
					paginatedItems.map((item: any, i: number) => (
						<OrderLine
							key={item.id}
							item={item}
							currencyCode={order.currency_code}
							reservations={reservationItemsMap[item.id]}
							isAllocatable={isAllocatable}
							paymentStt={order.payment_status}
							refetch={refetch}
						/>
					))
				) : (
					<Empty description="Không tìm thấy kết quả phù hợp" />
				)}

				{sortedItems.length > pageSize && (
					<div className="mt-4 flex justify-end">
						<Pagination
							current={currentPage}
							pageSize={pageSize}
							total={sortedItems.length}
							onChange={(page, size) => {
								setCurrentPage(page);
								setPageSize(size || 10);
							}}
						/>
					</div>
				)}
				<Divider className="my-2" />
				<DisplayTotalQuantity
					productTitle={'Tổng sản phẩm'}
					productQuantity={order.items.length}
					totalAmount={totalQuantity}
					quantityTitle={'Tổng số lượng'}
				/>
				<DisplayTotal
					currency={order.currency_code}
					totalAmount={Math.round(order.subtotal)}
					totalTitle={'Đơn giá'}
				/>
				{order?.discounts?.map((discount, index) => (
					<DisplayTotal
						key={index}
						currency={order.currency_code}
						totalAmount={-1 * order.discount_total}
						totalTitle={
							<div className="font-normal text-gray-900 flex items-center">
								{'Giảm giá'}
								{/* <Badge className="ml-3" variant="default"> */}
								{discount.code}
								{/* </Badge> */}
							</div>
						}
					/>
				))}
				{order?.gift_card_transactions?.map((gcTransaction, index) => (
					<DisplayTotal
						key={index}
						currency={order.currency_code}
						totalAmount={-1 * gcTransaction.amount}
						totalTitle={
							<div className="font-normal text-gray-900 flex items-center">
								Gift card:
								{/* <Badge className="ml-3" variant="default"> */}
								{gcTransaction.gift_card.code}
								{/* </Badge> */}
								{/* <div className="ml-2">
                  <CopyToClipboard
                    value={gcTransaction.gift_card.code}
                    showValue={false}
                    iconSize={16}
                  />
                </div> */}
							</div>
						}
					/>
				))}
				<DisplayTotal
					currency={order.currency_code}
					totalAmount={order.shipping_total}
					totalTitle={'Vận chuyển'}
				/>
				<DisplayTotal
					currency={order.currency_code}
					totalAmount={Math.round(order.tax_total || 0)}
					totalTitle={'Thuế (VAT)'}
				/>
				<DisplayTotal
					variant={'large'}
					currency={order.currency_code}
					totalAmount={Math.round(order.total)}
					totalTitle={hasMovements ? 'Tổng ban đầu' : 'Thành tiền'}
				/>
				<Divider className="my-2" />
				<PaymentDetails
					manualRefund={manualRefund}
					swapAmount={swapAmount}
					swapRefund={swapRefund}
					returnRefund={returnRefund}
					paidTotal={order.paid_total}
					refundedTotal={order.refunded_total}
					currency={order.currency_code}
				/>
			</div>
		</Card>
	);
};

export default Summary;
