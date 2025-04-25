'use client';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { ProductVariant } from '@medusajs/medusa';
import _ from 'lodash';
import { Search } from 'lucide-react';
import { useAdminVariants } from 'medusa-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
	ItemPrice,
	ItemQuantity,
} from '../../components/supplier-orders-modal';
import productColumns from './products-column';

type AddProductVariantProps = {
	state: boolean;
	onClose: () => void;
	regionId?: string;
	currencyCode?: string;
	customerId: string;
	isReplace?: boolean;
	isLoading?: boolean;
	onSubmit: (variantIds: string[], variants?: ProductVariant[]) => void;
	title: string;
	selectedItems?: string[];
	itemQuantities?: ItemQuantity[];
	itemPrices?: ItemPrice[];
	setItemQuantities?: React.Dispatch<React.SetStateAction<ItemQuantity[]>>;
	setItemPrices?: React.Dispatch<React.SetStateAction<ItemPrice[]>>;
	variantsDisabled?: string[];
};

const PAGE_SIZE = 10;

const AddProductVariant = (props: AddProductVariantProps) => {
	const {
		isReplace,
		regionId,
		customerId,
		itemPrices,
		itemQuantities,
		setItemQuantities,
		setItemPrices,
		variantsDisabled,
	} = props;
	const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
	const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>(
		[]
	);

	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { isLoading, count, variants } = useAdminVariants({
		q: searchValue,
		limit: PAGE_SIZE,
		offset: (currentPage - 1) * PAGE_SIZE,
		region_id: regionId,
		customer_id: customerId,
	});

	useEffect(() => {
		if (props.selectedItems) {
			setSelectedVariantIds(props.selectedItems);
		} else {
			setSelectedVariantIds([]);
			setSelectedVariants([]);
		}
	}, [props.selectedItems]);

	const onSubmit = async () => {
		try {
			// wait until onSubmit is done to reduce list jumping
			await props.onSubmit(selectedVariantIds, selectedVariants);
			props.onClose();
		} catch (error) {
			// Handle the error here
			console.log('Error:', error);
		}
	};

	const onBack = () => {
		setSelectedVariantIds([]);
		setSelectedVariants([]);
	};

	const handleRowSelectionChange = (
		selectedRowKeys: React.Key[],
		selectedRows: ProductVariant[]
	) => {
		// Identify deselected products
		const deselectedProducts = selectedVariantIds.filter(
			(productId) => !selectedRowKeys.includes(productId)
		);

		// Clear quantities and prices for deselected products
		setItemQuantities?.((prevQuantities) =>
			prevQuantities.filter(
				(item) => !deselectedProducts.includes(item.variantId)
			)
		);

		setItemPrices?.((prevPrices) =>
			prevPrices.filter((item) => !deselectedProducts.includes(item.variantId))
		);

		// Add default quantities and prices for newly selected products
		selectedRowKeys.forEach((productId) => {
			// Check if this product already has a quantity or price set
			const existingQuantity = itemQuantities?.find(
				(item) => item.variantId === productId
			);
			const existingPrice = itemPrices?.find(
				(item) => item.variantId === productId
			);

			// Find the selected product variant to get its default price
			const selectedVariant = variants?.find(
				(variant) => variant.id === productId
			);

			if (!existingQuantity) {
				// Set default quantity to 1 if not already present
				setItemQuantities?.((prevQuantities) => [
					...prevQuantities,
					{ variantId: productId as string, quantity: 1 },
				]);
			}

			if (!existingPrice && selectedVariant) {
				// Set the default price from the variant data if not already present
				setItemPrices?.((prevPrices) => [
					...prevPrices,
					{
						variantId: productId as string,
						unit_price: (selectedVariant as any).supplier_price || 0,
					},
				]);
			}
		});

		setSelectedVariantIds(selectedRowKeys as string[]);
		setSelectedVariants(selectedRows as ProductVariant[]);
	};

	const handleQuantityChange = (value: number, variantId: string) => {
		setItemQuantities?.((prevQuantities) => {
			const existingItemIndex = prevQuantities.findIndex(
				(item) => item.variantId === variantId
			);

			if (existingItemIndex !== -1) {
				const updatedQuantities = [...prevQuantities];
				updatedQuantities[existingItemIndex] = {
					...updatedQuantities[existingItemIndex],
					quantity: Math.max(0, value),
				};
				return updatedQuantities;
			} else {
				return [...prevQuantities, { variantId, quantity: Math.max(0, value) }];
			}
		});
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	// set item quantities
	const handleToAddQuantity = (value: number, variantId: string) => {
		setItemQuantities?.((prevQuantities) => {
			const existingItemIndex = prevQuantities.findIndex(
				(item) => item.variantId === variantId
			);

			if (existingItemIndex !== -1) {
				const updatedQuantities = [...prevQuantities];
				updatedQuantities[existingItemIndex] = {
					...updatedQuantities[existingItemIndex],
					quantity: Math.max(
						0,
						updatedQuantities[existingItemIndex].quantity + value
					),
				};
				return updatedQuantities;
			} else {
				return [...prevQuantities, { variantId, quantity: Math.max(0, value) }];
			}
		});
	};

	// set item prices
	const handlePriceChange = (value: number | null, variantId: string) => {
		setItemPrices?.((prevPrices) => {
			const existingItemIndex = prevPrices.findIndex(
				(item) => item.variantId === variantId
			);

			if (existingItemIndex !== -1) {
				const updatedPrices = [...prevPrices];
				updatedPrices[existingItemIndex] = {
					...updatedPrices[existingItemIndex],
					unit_price: value ?? 0,
				};
				return updatedPrices;
			} else {
				return [...prevPrices, { variantId, unit_price: value ?? 0 }];
			}
		});
	};

	const columns = useMemo(
		() =>
			productColumns({
				itemQuantities: itemQuantities ?? [],
				handleToAddQuantity,
				itemPrices: itemPrices ?? [],
				handlePriceChange,
				handleQuantityChange,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[itemQuantities, itemPrices]
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<Modal
			open={props.state}
			handleOk={onSubmit}
			isLoading={props?.isLoading}
			disabled={props?.isLoading}
			handleCancel={props.onClose}
			width={800}
		>
			<Title level={4} className="text-center">
				{props.title ?? 'Thêm biến thể sản phẩm'}
			</Title>
			<Flex
				align="center"
				justify="flex-end"
				className="p-4 border-0 border-b border-solid border-gray-200"
			>
				<Input
					placeholder="Nhập tên sản phẩm"
					className="w-[200px] text-xs"
					size="small"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
				/>
			</Flex>
			<Table
				rowSelection={{
					type: isReplace ? 'radio' : 'checkbox',
					selectedRowKeys: selectedVariantIds,
					onChange: handleRowSelectionChange as any,
					preserveSelectedRowKeys: true,
					getCheckboxProps: (record: any) => ({
						disabled:
							variantsDisabled?.findIndex((c) => c === record.id) !== -1,
					}),
				}}
				loading={isLoading}
				columns={columns as any}
				dataSource={variants ?? []}
				rowKey="id"
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage as number,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} biến thể sản phẩm`,
				}}
			/>
		</Modal>
	);
};

export default AddProductVariant;
