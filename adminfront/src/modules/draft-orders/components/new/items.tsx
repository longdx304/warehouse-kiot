import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Tabs } from '@/components/Tabs';
import { Tooltip } from '@/components/Tooltip';
import { useAdminVariantsSku } from '@/lib/hooks/api/variants';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { useStepModal } from '@/lib/providers/stepped-modal-provider';
import { formatNumber } from '@/lib/utils';
import { ProductVariant, Region } from '@medusajs/medusa';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { Table, TabsProps } from 'antd';
import _, { differenceBy } from 'lodash';
import { CircleCheck, CircleX, Search, Upload } from 'lucide-react';
import { useAdminVariants } from 'medusa-react';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNewDraftOrderForm } from '../../hooks/use-new-draft-form';
import UploadModal from './modal-upload';
import productsColumns from './product-columns';

const PAGE_SIZE = 10;

interface VariantQuantity {
	variantId: string;
	quantity: number;
}

export interface VariantPrice {
	variantId: string;
	unit_price: number;
	amount?: number;
}

const Items = () => {
	const { state, onOpen, onClose } = useToggleState();

	const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
	const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>(
		[]
	);
	const [variantQuantities, setVariantQuantities] = useState<VariantQuantity[]>(
		[]
	);
	const [variantPrices, setVariantPrices] = useState<VariantPrice[]>([]);

	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [activeTab, setActiveTab] = useState<TabsProps['activeKey']>('list');

	const {
		context: { region, setItems, items, dataFromExcel, setDataFromExcel },
		form,
	} = useNewDraftOrderForm();
	const { enableNext, disableNext } = useStepModal();

	// Fetch variants
	const { isLoading, count, variants } = useAdminVariants({
		q: searchValue,
		limit: PAGE_SIZE,
		offset: (currentPage - 1) * PAGE_SIZE,
		region_id: region?.id,
		customer_id: form.getFieldValue('customer_id'),
	});

	const { variants: variantsBySku } = useAdminVariantsSku(
		{
			sku: dataFromExcel.map((item) => item.sku),
			region_id: region?.id,
			customer_id: form.getFieldValue('customer_id'),
		},
		{
			enabled: dataFromExcel.length > 0,
		}
	);

	// Separate query to fetch selected variants
	const { variants: selectedVariantsData, count: selectedVariantsCount } =
		useAdminVariants(
			items?.length > 0
				? {
						id: items.map((item) => item.variant_id),
						region_id: region?.id,
						customer_id: form.getFieldValue('customer_id'),
				  }
				: undefined,
			{
				enabled: !!items?.length,
			}
		);

	// Get default price for a variant
	const getDefaultPrice = (variant: any) => {
		if (!variant) {
			return {
				amount: 0,
				currency_code: region?.currency_code || 'vnd',
			};
		}

		// If calculated_price_type is override or sale, use calculated_price
		// Otherwise use original_price
		const priceAmount =
			variant.calculated_price_type === 'override' ||
			variant.calculated_price_type === 'sale'
				? Math.round(variant.calculated_price_incl_tax)
				: Math.round(variant.original_price_incl_tax);

		return {
			amount: priceAmount ?? 0,
			currency_code: region?.currency_code || 'vnd',
		};
	};

	/**
	 * Handle row selection change.
	 *
	 * Updates the state with the new selected variants and their quantities.
	 * If the priced variants are available, it also updates the form items.
	 *
	 * @param {React.Key[]} selectedRowKeys - The keys of the selected rows.
	 * @param {ProductVariant[]} selectedRows - The selected rows.
	 */
	const handleRowSelectionChange = (
		selectedRowKeys: React.Key[],
		selectedRows: ProductVariant[]
	) => {
		setSelectedVariantIds(selectedRowKeys as string[]);
		setSelectedVariants(selectedRows as ProductVariant[]);

		// Initialize quantities for newly selected variants
		const newQuantities = selectedRows?.map((variant) => ({
			variantId: variant?.id,
			quantity: 1,
		}));

		// Preserve existing quantities for previously selected variants
		const updatedQuantities = newQuantities?.map((newQuant) => {
			const existing = variantQuantities.find(
				(q) => q.variantId === newQuant.variantId
			);
			return existing || newQuant;
		});

		setVariantQuantities(updatedQuantities as any);

		// Initialize prices for newly selected variants
		const newPrices = selectedRows?.map((variant) => ({
			variantId: variant?.id,
			unit_price: getDefaultPrice(variant).amount,
		}));

		// Preserve existing prices for previously selected variants
		const updatedPrices = newPrices?.map((newPrice) => {
			const existing = variantPrices.find(
				(p) => p.variantId === newPrice.variantId
			);
			return existing || newPrice;
		});

		setVariantPrices(updatedPrices as any);

		// Wait for pricedVariants to be available before updating form items
		updateFormItems(selectedRows as any, variantQuantities, updatedPrices);
	};

	const updateFormItems = (
		variants: ProductVariant[],
		quantities: VariantQuantity[],
		prices?: VariantPrice[]
	) => {
		const formItems = variants.map((variant) => {
			const selectedQuantity =
				quantities.find((q) => q.variantId === variant?.id)?.quantity || 1;

			const selectedPrice =
				prices?.find((p) => p.variantId === variant?.id)?.unit_price || 0;

			const variantImages = variant?.product?.metadata?.variant_images
				? JSON.parse(variant?.product?.metadata?.variant_images as string)
				: [];

			const variantImage = variantImages.find(
				(image: any) => image.variant_value === variant.title
			);

			const thumbnail = variantImage?.image_url
				? variantImage?.image_url
				: variant?.product?.thumbnail ?? '/images/product-img.png';

			return {
				quantity: selectedQuantity,
				unit_price: selectedPrice,
				variant_id: variant?.id,
				title: variant?.title as string,
				product_title: variant?.product?.title,
				thumbnail: thumbnail,
			};
		});
		setItems(formItems);
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
			setCurrentPage(1);
		},
		500
	);

	// Handle page change
	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	useEffect(() => {
		if (variantPrices.some((p) => p.unit_price === 0)) {
			disableNext();
			return;
		}
		if (selectedVariants.length > 0) {
			enableNext();
		} else {
			disableNext();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVariants, variantPrices]);

	// Handle quantity changes
	const handleQuantityChange = (value: number, variantId: string) => {
		setVariantQuantities((prev) => {
			const updated = prev.map((q) =>
				q.variantId === variantId ? { ...q, quantity: value } : q
			);
			return updated;
		});

		setItems((prevItems = []) => {
			return prevItems.map((item) =>
				item.variant_id === variantId ? { ...item, quantity: value } : item
			);
		});
	};

	// Handle price changes
	const handlePriceChange = (
		variantId: string,
		value: number,
		currency: string
	) => {
		setVariantPrices((prev) => {
			const updated = prev.map((p) =>
				p.variantId === variantId
					? { ...p, unit_price: value, currency_code: currency }
					: p
			);
			return updated;
		});

		setItems((prevItems) => {
			return prevItems.map((item) =>
				item.variant_id === variantId ? { ...item, unit_price: value } : item
			);
		});
	};

	const getVariantPrice = (variant: any, region: Region) => {
		if (
			variant.calculated_price_type === 'override' ||
			variant.calculated_price_type === 'sale'
		) {
			return Math.round(variant.calculated_price_incl_tax) ?? 0;
		}

		// If original_price exists, use it
		if (variant.original_price) {
			return Math.round(variant.original_price_incl_tax);
		}

		let price = variant?.prices?.find(
			(p: any) =>
				p.currency_code.toLowerCase() === region?.currency_code?.toLowerCase()
		);

		const taxRate = region?.tax_rate ?? 0;

		return price?.amount * (1 + taxRate / 100) || 0;
	};

	const columns = productsColumns({
		currency: region?.currency_code,
		// edit quantity
		getQuantity: (variantId: string) =>
			variantQuantities.find((q) => q.variantId === variantId)?.quantity ?? 1,
		handleQuantityChange,
		// edit price
		getPrice: (variantId: string) => {
			const variant = variants?.find((v) => v.id === variantId);
			const customPrice = variantPrices.find(
				(p) => p.variantId === variantId
			)?.unit_price;

			return customPrice && customPrice !== 0
				? customPrice
				: variant
				? getVariantPrice(variant, region as Region)
				: 0;
		},
		handlePriceChange,
	});

	const handleDisable = (record: PricedVariant) => {
		if ((record?.inventory_quantity || 0) > 0 || record?.allow_backorder) {
			return false;
		}
		return true;
	};

	const itemTabs: TabsProps['items'] = [
		{
			key: 'list',
			label: 'Danh sách',
		},
		{
			key: 'checked',
			label: 'Đã chọn',
		},
	];

	const handleTabChange = (key: string) => {
		setActiveTab(key);
	};

	// Sync selected variants with prices and quantities with items context
	useEffect(() => {
		if (items?.length > 0 && selectedVariantsData) {
			// Get variant IDs from items
			const itemVariantIds = items.map((item) => item.variant_id);
			setSelectedVariantIds(itemVariantIds);

			// Use selectedVariantsData instead of filtered variants
			setSelectedVariants(selectedVariantsData as any);

			// Sync quantities
			const quantities = items.map((item) => ({
				variantId: item.variant_id,
				quantity: item.quantity,
			}));
			setVariantQuantities(quantities);

			// Sync prices
			const prices = items.map((item) => ({
				variantId: item.variant_id,
				unit_price: item.unit_price,
			}));

			setVariantPrices(prices);
		}
	}, [items, selectedVariantsData]);

	const totalPrice = useMemo(() => {
		return variantPrices.reduce((total, item) => {
			const quantity =
				variantQuantities.find((q) => q.variantId === item.variantId)
					?.quantity || 0;
			return total + item.unit_price * quantity;
		}, 0);
	}, [variantPrices, variantQuantities]);

	// Total quantity
	const totalQuantity = useMemo(() => {
		return variantQuantities.reduce((total, item) => total + item.quantity, 0);
	}, [variantQuantities]);

	// Find variants not in dataFromExcel
	const dataFromExcelError = useMemo(() => {
		if (!variantsBySku?.length) {
			return [];
		}
		const errors = differenceBy(dataFromExcel, variantsBySku, 'sku');
		return errors;
	}, [dataFromExcel, variantsBySku]);

	// Find duplicates in dataFromExcel
	const dataFromExcelDuplicate = useMemo(() => {
		if (!dataFromExcel?.length) return [];

		// Group items by SKU
		const grouped = _.groupBy(dataFromExcel, 'sku');

		// Filter groups that have more than 1 item (duplicates)
		return Object.entries(grouped)
			.filter(([_, items]) => items.length > 1)
			.map(([sku, items]) => ({
				sku,
				count: items.length,
				items,
			}));
	}, [dataFromExcel]);

	// Select all variants from Excel
	useEffect(() => {
		if (!variantsBySku?.length) return;

		// Initialize quantities for newly selected variants
		const newQuantities = variantsBySku.map((variant) => {
			// Find all items in Excel with matching SKU
			const excelItems = dataFromExcel.filter(
				(item) => item.sku === variant.sku
			);

			// Sum up quantities if there are multiple items with the same SKU
			const totalQuantity = excelItems.reduce(
				(sum, item) => sum + (item.quantity || 0),
				0
			);

			return {
				variantId: variant.id,
				quantity: totalQuantity || 1, // Use 1 as fallback if no quantity found
			};
		});

		// Preserve existing quantities for previously selected variants
		const updatedQuantities = newQuantities.map((newQuant) => {
			const existing = variantQuantities.find(
				(q) => q.variantId === newQuant.variantId
			);
			return existing || newQuant;
		});

		setVariantQuantities(updatedQuantities);

		// Initialize prices for newly selected variants
		const newPrices = variantsBySku.map((variant) => {
			const findVaraintExcel = dataFromExcel.find(
				(item) => item.sku === variant.sku
			);

			return {
				variantId: variant.id,
				unit_price: findVaraintExcel?.price || getDefaultPrice(variant).amount,
			};
		});

		// Preserve existing prices for previously selected variants
		const updatedPrices = newPrices.map((newPrice) => {
			const existing = variantPrices.find(
				(p) => p.variantId === newPrice.variantId
			);
			return existing || newPrice;
		});

		setVariantPrices(updatedPrices);

		// Wait for pricedVariants to be available before updating form items
		updateFormItems(variantsBySku, updatedQuantities, updatedPrices);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [variantsBySku]);

	const handleExcelOpen = () => {
		setActiveTab('checked');
		onOpen();
		setSelectedVariantIds([]);
		setSelectedVariants([]);
		setVariantQuantities([]);
		setVariantPrices([]);
		setDataFromExcel([]);
		setItems([]);
	};
	return (
		<>
			<Flex
				align="center"
				justify="space-between"
				className="p-4 border-0 border-b border-solid border-gray-200"
			>
				<div>
					<Button icon={<Upload />} onClick={handleExcelOpen} />
					{dataFromExcel.length > 0 && (
						<Flex className="gap-x-2 mt-1">
							<Flex align="center" className="gap-x-1 text-xs">
								<CircleCheck size={16} color="green" />
								<span>{variantsBySku?.length} sản phẩm</span>
							</Flex>
							<Tooltip
								title={
									<pre className="max-w-xs whitespace-pre-wrap break-words">
										{dataFromExcelError.length > 0 && (
											<>
												Không tìm thấy SKU:
												{'\n'}
												{dataFromExcelError
													.map((item, index) => `${index + 1}. ${item.sku}`)
													.join('\n')}
											</>
										)}
										{dataFromExcelError.length > 0 &&
											dataFromExcelDuplicate.length > 0 &&
											'\n\n'}
										{dataFromExcelDuplicate.length > 0 && (
											<>
												SKU trùng lặp:
												{'\n'}
												{dataFromExcelDuplicate
													.map(
														(item, index) =>
															`${index + 1}. ${item.sku} (${item.count} lần)`
													)
													.join('\n')}
											</>
										)}
									</pre>
								}
								placement="top"
							>
								<Flex align="center" className="gap-x-1 text-xs">
									<CircleX size={16} color="red" />
									<span>{dataFromExcelError.length} sản phẩm</span>
								</Flex>
							</Tooltip>
						</Flex>
					)}
				</div>
				<Input
					placeholder="Nhập tên sản phẩm"
					className="w-[200px] text-xs"
					size="small"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
				/>
			</Flex>
			<div className="flex justify-center">
				<Tabs
					items={itemTabs}
					onChange={handleTabChange}
					activeKey={activeTab}
				/>
			</div>
			<div className="flex justify-end">{`Đã chọn : ${
				selectedVariantsCount ?? 0
			} biến thể`}</div>
			<Table
				rowSelection={{
					selectedRowKeys: selectedVariantIds,
					onChange: handleRowSelectionChange as any,
					preserveSelectedRowKeys: true,
					getCheckboxProps: (record: any) => ({
						disabled: handleDisable(record),
					}),
				}}
				loading={isLoading}
				columns={columns as any}
				dataSource={(activeTab === 'list' ? variants : selectedVariants) ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={
					activeTab === 'list'
						? {
								total: count,
								pageSize: PAGE_SIZE,
								current: currentPage,
								onChange: handleChangePage,
								showSizeChanger: false,
						  }
						: false
				}
				summary={() => (
					<>
						{activeTab === 'checked' && (
							<Table.Summary fixed>
								<Table.Summary.Row>
									<Table.Summary.Cell index={0} />
									<Table.Summary.Cell index={1}>
										{selectedVariants?.length} (sản phẩm)
									</Table.Summary.Cell>
									<Table.Summary.Cell index={2} className="text-center">
										{totalQuantity} (đôi)
									</Table.Summary.Cell>
									<Table.Summary.Cell index={3} className="text-center">
										{formatNumber(totalPrice)}
										{region?.currency.symbol}
									</Table.Summary.Cell>
								</Table.Summary.Row>
							</Table.Summary>
						)}
					</>
				)}
			/>
			{state && (
				<UploadModal
					state={state}
					handleCancel={onClose}
					setDataFromExcel={setDataFromExcel}
				/>
			)}
		</>
	);
};

export default Items;
