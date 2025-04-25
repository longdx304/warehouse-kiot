import { Button } from '@/components/Button';
import { Empty } from '@/components/Empty';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Pagination } from '@/components/Pagination';
import { Title } from '@/components/Typography';
import {
	useAdminDeleteSupplierOrderEdit,
	useAdminRequestSOrderEditConfirmation,
	useAdminSupplierOrderEditAddLineItem,
	useAdminUpdateSupplierOrderEdit,
} from '@/lib/hooks/api/supplier-order-edits';
import useToggleState from '@/lib/hooks/use-toggle-state';
import AddProductVariant from '@/modules/supplier-orders/common/add-product-variant';
import {
	AddOrderEditLineItemInput,
	SupplierOrder,
	SupplierOrderEdit,
} from '@/types/supplier';
import { formatAmountWithSymbol } from '@/utils/prices';
import { ProductVariant } from '@medusajs/medusa';
import { message } from 'antd';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSupplierOrderEdit } from './context';
import SupplierOrderEditLine from './supplier-order-edit-line';
import { ItemPrice, ItemQuantity } from '../../supplier-orders-modal';
import debounce from 'lodash/debounce';

type SupplierOrderEditModalContainerProps = {
	supplierOrder: SupplierOrder | null;
};

const SupplierOrderEditModalContainer = (
	props: SupplierOrderEditModalContainerProps
) => {
	const { supplierOrder } = props;

	const { isModalVisible, hideModal, supplierOrderEdits, activeOrderEditId } =
		useSupplierOrderEdit();

	const supplierOrderEdit = supplierOrderEdits?.find(
		(oe) => oe.id === activeOrderEditId
	);

	const onClose = () => {
		hideModal();
	};

	if (!supplierOrderEdit) {
		return null;
	}

	return (
		<SupplierOrderEditModal
			state={isModalVisible}
			close={onClose}
			supplierOrderEdit={supplierOrderEdit}
			currentSubtotal={supplierOrder?.subtotal}
			regionId={supplierOrder?.cart?.region_id}
			customerId={supplierOrder?.user?.id}
			currencyCode={supplierOrder?.currency_code}
			paidTotal={supplierOrder?.paid_total}
			refundedTotal={supplierOrder?.refunded_total}
		/>
	);
};

export default SupplierOrderEditModalContainer;

type SupplierOrderEditModalProps = {
	state: boolean;
	close: () => void;
	supplierOrderEdit: SupplierOrderEdit;
	currencyCode?: string;
	regionId?: string;
	customerId?: string;
	currentSubtotal?: number;
	paidTotal?: number;
	refundedTotal?: number;
};

const PAGE_SIZE = 10;
const SupplierOrderEditModal = (props: SupplierOrderEditModalProps) => {
	const {
		state,
		close,
		supplierOrderEdit,
		currencyCode,
		regionId,
		customerId,
		currentSubtotal,
		paidTotal,
		refundedTotal,
	} = props;

	const {
		state: stateAddProduct,
		onOpen: openAddProduct,
		onClose: closeAddProduct,
	} = useToggleState(false);

	const filterRef = useRef<HTMLInputElement>(null);
	const [note, setNote] = useState<string | undefined>();
	const [showFilter, setShowFilter] = useState(false);
	const [filterTerm, setFilterTerm] = useState<string>('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);
	const [itemQuantities, setItemQuantities] = useState<ItemQuantity[]>([]);
	const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);

	const showTotals = currentSubtotal !== supplierOrderEdit?.subtotal;
	const hasChanges = !!supplierOrderEdit?.changes?.length;

	const {
		mutateAsync: requestConfirmation,
		isLoading: isRequestingConfirmation,
	} = useAdminRequestSOrderEditConfirmation(supplierOrderEdit?.id);

	const { mutateAsync: updateOrderEdit, isLoading: isUpdating } =
		useAdminUpdateSupplierOrderEdit(supplierOrderEdit?.id);

	const { mutateAsync: deleteOrderEdit } = useAdminDeleteSupplierOrderEdit(
		supplierOrderEdit?.id
	);

	const { mutateAsync: addLineItem, isLoading: loadingAddLineItem } =
		useAdminSupplierOrderEditAddLineItem(supplierOrderEdit?.id);

	const onSave = async () => {
		try {
			await requestConfirmation(undefined);
			if (note) {
				await updateOrderEdit({ internal_note: note });
			}
			message.success('Đặt chỉnh sửa đơn hàng như đã yêu cầu');
		} catch (e: any) {
			message.error('Yêu cầu xác nhận thất bại');
		}
		close();
	};

	const onCancel = async () => {
		// NOTE: has to be this order of ops
		await deleteOrderEdit(undefined);
		close();
	};

	useEffect(() => {
		if (showFilter) {
			filterRef?.current?.focus();
		}
	}, [showFilter]);

	const onAddVariants = async (selectedVariants: ProductVariant['id'][]) => {
		// Creating the lineItems array by merging quantities and prices
		const lineItems: AddOrderEditLineItemInput[] = selectedVariants?.map(
			(variantId) => {
				const quantityData = itemQuantities?.find(
					(item) => item.variantId === variantId
				);
				const priceData = itemPrices?.find(
					(item) => item.variantId === variantId
				);

				return {
					variant_id: variantId,
					quantity: quantityData?.quantity || 0,
					unit_price: priceData?.unit_price || 0,
				};
			}
		);

		try {
			const promises = lineItems.map((lineItem) =>
				addLineItem({
					variant_id: lineItem.variant_id,
					quantity: lineItem.quantity,
					unit_price: lineItem.unit_price,
				})
			);

			await Promise.all(promises);
			message.success('Thêm biến thể sản phẩm thành công');
		} catch (e: any) {
			console.log('Error:', e);
			message.error('Có lỗi xảy ra');
		}
	};

	let displayItems =
		supplierOrderEdit?.items?.sort((a, b) => {
			const productIdA = a?.variant?.product_id || '';
			const productIdB = b?.variant?.product_id || '';
			return productIdA.localeCompare(productIdB);
		}) || [];

	// sort with time
	displayItems = displayItems.sort((a, b) => {
		const createdAtA = a?.created_at || '';
		const createdAtB = b?.created_at || '';
		return new Date(createdAtB)
			.toISOString()
			.localeCompare(new Date(createdAtA).toISOString());
	});

	if (filterTerm) {
		displayItems = displayItems?.filter(
			(i) =>
				i?.title?.toLowerCase().includes(filterTerm) ||
				i?.variant?.sku?.toLowerCase().includes(filterTerm) ||
				i?.variant?.title?.toLowerCase().includes(filterTerm)
		);
	}

	// Paginated items
	const startIndex = (currentPage - 1) * pageSize;
	const paginatedItems = displayItems?.slice(startIndex, startIndex + pageSize);

	// Search items
	const handleChangeDebounce = debounce(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setCurrentPage(1);
			setFilterTerm(e.target.value);
			setPageSize(PAGE_SIZE);
		},
		1000
	);

	return (
		<Modal
			open={state}
			handleOk={onSave}
			isLoading={isUpdating || isRequestingConfirmation}
			disabled={isUpdating || isRequestingConfirmation || !hasChanges}
			handleCancel={onCancel}
			width={800}
		>
			<Title level={3} className="text-center">
				{'Chỉnh sửa đơn hàng'}
			</Title>
			<Flex justify="space-between" className="mt-4">
				<Flex align="center">
					<Input
						placeholder="Tên sản phẩm..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				<Flex className="text-xs pt-4">
					<Button type="default" className="w-fit" onClick={openAddProduct}>
						{'Thêm sản phẩm'}
					</Button>
				</Flex>
			</Flex>
			<div className="flex flex-col mt-4">
				{/* ITEMS */}
				{paginatedItems?.length > 0 ? (
					paginatedItems.map((oi) => (
						<SupplierOrderEditLine
							key={oi.id}
							item={oi}
							currencyCode={currencyCode ?? ''}
							change={
								supplierOrderEdit?.changes?.find(
									(change) =>
										change.line_item_id === oi.id ||
										change.original_line_item_id === oi.id
								) || undefined
							}
						/>
					))
				) : (
					<Empty description="Không tìm thấy kết quả phù hợp" />
				)}

				{displayItems.length > pageSize && (
					<div className="mt-4 flex justify-center">
						<Pagination
							current={currentPage}
							pageSize={pageSize}
							total={displayItems.length}
							onChange={(page, size) => {
								setCurrentPage(page);
								setPageSize(size || 5);
							}}
						/>
					</div>
				)}
				{/* TOTALS */}
				{showTotals && (
					// <TotalsSection currencyCode={currencyCode} amountPaid={paidTotal} />
					<TotalsSection
						currencyCode={currencyCode ?? 'vnd'}
						amountPaid={(paidTotal ?? 0) - (refundedTotal ?? 0)}
						newTotal={supplierOrderEdit.total}
						differenceDue={
							supplierOrderEdit.total - (paidTotal ?? 0) // (orderEdit_total - refunded_total) - (paidTotal - refundedTotal)
						}
					/>
				)}

				{/* NOTE */}
				{hasChanges && (
					<div className="flex items-center justify-between">
						<span className="text-gray-500">{'Ghi chú'}</span>
						<Input
							className="max-w-[455px]"
							placeholder="Thêm ghi chú"
							onChange={(value: any) => setNote(value)}
							value={note}
						/>
					</div>
				)}
			</div>
			<AddProductVariant
				title="Thêm biến thể sản phẩm"
				state={stateAddProduct}
				onClose={closeAddProduct}
				onSubmit={onAddVariants}
				customerId={customerId ?? ''}
				regionId={regionId}
				currencyCode={currencyCode}
				isLoading={loadingAddLineItem}
				itemQuantities={itemQuantities}
				itemPrices={itemPrices}
				setItemQuantities={setItemQuantities}
				setItemPrices={setItemPrices}
				variantsDisabled={supplierOrderEdit.items.map((i) => i.variant.id)}
			/>
		</Modal>
	);
};

type TotalsSectionProps = {
	amountPaid: number;
	currencyCode: string;
	newTotal: number;
	differenceDue: number;
};

/**
 * Totals section displaying order and order edit subtotals.
 */
function TotalsSection(props: TotalsSectionProps) {
	const { currencyCode, amountPaid, newTotal, differenceDue } = props;

	return (
		<>
			<div className="bg-gray-200 mb-6 w-full" />
			<div className="mb-2 flex h-[40px] justify-between">
				<span className="text-gray-500">{'Số tiền đã thanh toán'}</span>
				<span className="text-gray-900">
					{formatAmountWithSymbol({
						amount: amountPaid,
						currency: currencyCode,
					})}
					<span className="text-gray-400"> {currencyCode.toUpperCase()}</span>
				</span>
			</div>

			<div className="mb-2 flex h-[40px] justify-between">
				<span className="font-semibold text-gray-900">{'Tổng mới'}</span>
				<span className="text-2xl font-semibold">
					{formatAmountWithSymbol({
						amount: newTotal,
						currency: currencyCode,
					})}
				</span>
			</div>

			<div className="flex justify-between">
				<span className="text-gray-500">{'Sự khác biệt cần thanh toán'}</span>
				<span
					className={clsx('', {
						'text-rose-500': differenceDue < 0,
						'text-emerald-500': differenceDue >= 0,
					})}
				>
					{formatAmountWithSymbol({
						amount: differenceDue,
						currency: currencyCode,
					})}
					<span className="text-gray-400"> {currencyCode.toUpperCase()}</span>
				</span>
			</div>

			<div className="bg-gray-200 mt-8 mb-6 h-px w-full" />
		</>
	);
}
