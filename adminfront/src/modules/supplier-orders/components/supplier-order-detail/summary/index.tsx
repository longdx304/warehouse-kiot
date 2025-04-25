import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Pagination } from '@/components/Pagination';
import { Title } from '@/components/Typography';
import {
	DisplayTotal,
	DisplayTotalQuantity,
} from '@/modules/supplier-orders/common';
import { SupplierOrder } from '@/types/supplier';
import { ReservationItemDTO } from '@medusajs/types';
import { Divider, Empty } from 'antd';
import _ from 'lodash';
import { Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSupplierOrderEdit } from '../edit-supplier-order-modal/context';
import OrderLine from './order-line';

type Props = {
	supplierOrder: SupplierOrder | undefined;
	isLoading: boolean;
	reservations: ReservationItemDTO[];
	refetch: () => void;
};

const PAGE_SIZE = 10;

const Summary = ({
	supplierOrder,
	isLoading,
	reservations = [],
	refetch,
}: Props) => {
	const { showModal } = useSupplierOrderEdit();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);
	const [searchValue, setSearchValue] = useState('');

	const isCancelled = supplierOrder?.status === 'canceled';

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

	const actions = useMemo(() => {
		const actionAbles = [];
		actionAbles.push({
			label: <span>{'Chỉnh sửa đơn hàng'}</span>,
			icon: <Pencil size={16} />,
			onClick: () => {
				showModal();
			},
			disabled: isCancelled,
		});
		return actionAbles;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!supplierOrder) {
		return (
			<Card loading={isLoading}>
				<Empty description="Chưa có đơn hàng" />
			</Card>
		);
	}

	const isAllocatable = !['canceled', 'archived'].includes(
		supplierOrder.status
	);

	const totalQuantity = supplierOrder.items.reduce(
		(acc, item) => acc + item.quantity,
		0
	);

	// Filter items based on the search term
	const filteredItems = supplierOrder.items.filter(
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
							currencyCode={supplierOrder.currency_code}
							reservations={reservationItemsMap[item.id]}
							isAllocatable={isAllocatable}
							paymentStt={supplierOrder?.payment_status}
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
					productQuantity={supplierOrder.items.length}
					totalAmount={totalQuantity}
					quantityTitle={'Tổng số lượng'}
				/>
				<DisplayTotal
					currency={supplierOrder.currency_code}
					totalAmount={supplierOrder.subtotal}
					totalTitle={'Tạm tính'}
				/>

				<DisplayTotal
					currency={supplierOrder.currency_code}
					totalAmount={supplierOrder.tax_total}
					totalTitle={'Thuế'}
				/>
				<DisplayTotal
					variant={'large'}
					currency={supplierOrder.currency_code}
					totalAmount={supplierOrder.total}
					totalTitle={'Tổng cộng'}
				/>
			</div>
		</Card>
	);
};

export default Summary;
