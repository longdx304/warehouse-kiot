import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { ProductModal } from '@/modules/products/components/products-modal';
import { Product, Region } from '@medusajs/medusa';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { Col, Row, message } from 'antd';
import _ from 'lodash';
import { Plus, Search } from 'lucide-react';
import {
	useAdminCollections,
	useAdminProductCategories,
	useAdminVariants,
} from 'medusa-react';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { ItemQuantity } from '..';
import productColumns from './product-columns';

type ProductFormProps = {
	selectedProducts: string[];
	setSelectedProducts: (products: string[]) => void;
	setSelectedRowsProducts: (products: any) => void;
	setCurrentStep: (step: number) => void;
	handleCancel: () => void;
	itemQuantities: ItemQuantity[];
	setItemQuantities: React.Dispatch<React.SetStateAction<ItemQuantity[]>>;

	regions: Region[] | undefined;
	regionId: string | null;
	setRegionId: (regionId: string) => void;
};
const PAGE_SIZE = 10;

const ProductForm: FC<ProductFormProps> = ({
	selectedProducts,
	setSelectedProducts,
	setSelectedRowsProducts,
	setCurrentStep,
	handleCancel,
	itemQuantities,
	setItemQuantities,

	regions,
	regionId,
	setRegionId,
}) => {
	const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const { state, onOpen, onClose } = useToggleState(false);

	const handleRowSelectionChange = (
		selectedRowKeys: React.Key[],
		selectedRows: any
	) => {
		// Identify deselected products
		const deselectedProducts = selectedProducts.filter(
			(productId) => !selectedRowKeys.includes(productId)
		);

		// Clear quantities and prices for deselected products
		setItemQuantities((prevQuantities) =>
			prevQuantities.filter(
				(item) => !deselectedProducts.includes(item.variantId)
			)
		);

		// Add default quantities and prices for newly selected products
		selectedRowKeys.forEach((productId) => {
			// Check if this product already has a quantity or price set
			const existingQuantity = itemQuantities.find(
				(item) => item.variantId === productId
			);

			// Find the selected product variant to get its default price
			const selectedVariant = variants?.find(
				(variant) => variant.id === productId
			);

			if (!existingQuantity) {
				// Set default quantity to 1 if not already present
				setItemQuantities((prevQuantities) => [
					...prevQuantities,
					{ variantId: productId as string, quantity: 1 },
				]);
			}
		});

		// Update selected products
		setSelectedProducts(selectedRowKeys as string[]);
		setSelectedRowsProducts(selectedRows as PricedVariant[]);
	};

	const handleChangeDebounce = _.debounce(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	const { variants, count, isLoading } = useAdminVariants({
		q: searchValue,
		limit: PAGE_SIZE,
		offset: (currentPage - 1) * PAGE_SIZE,
	});

	const { product_categories } = useAdminProductCategories({
		parent_category_id: 'null',
		include_descendants_tree: true,
		is_internal: false,
	});
	const { collections } = useAdminCollections();

	const handleQuantityChange = (value: number, variantId: string) => {
		setItemQuantities((prevQuantities) => {
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

	const columns = useMemo(
		() =>
			productColumns({
				itemQuantities,
				// handlePriceChange,
				handleQuantityChange,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[itemQuantities]
	);

	const onSubmit = () => {
		// Check if any selected product exists
		if (selectedProducts.length === 0) {
			message.error('Phải chọn ít nhất một sản phẩm');
			return;
		}

		// Check if itemQuantities and itemPrices have entries for all selected products
		if (
			itemQuantities.length !== selectedProducts.length ||
			!selectedProducts.every((productId) =>
				itemQuantities.some((item) => item.variantId === productId)
			)
		) {
			message.error('Phải nhập số lượng và giá cho tất cả sản phẩm đã chọn');
			return;
		}

		// Check if all quantities are greater than 0
		if (!itemQuantities.every((item) => item.quantity > 0)) {
			message.error('Số lượng sản phẩm phải lớn hơn 0');
			return;
		}

		// Check the selected region is checked
		if (!regionId) {
			message.error('Vui lòng chọn khu vực');
			return;
		}

		setCurrentStep(1);
	};

	const handleCloseModal = () => {
		setCurrentProduct(null);
		onClose();
	};

	// handle region change
	const handleRegionChange = (value: string) => {
		setRegionId(value);
	};

	// get default value region by name
	const defaultRegion = regions?.find((region) => region.name === 'Vietnam');

	// set default region
	useEffect(() => {
		if (defaultRegion) {
			setRegionId(defaultRegion.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultRegion]);

	return (
		<Row gutter={[16, 16]} className="pt-4">
			<Col span={24}>
				<Flex
					align="center"
					justify="space-between"
					className="p-4 border-0 border-b border-solid border-gray-200"
				>
					<Title level={4} className="">
						Chọn sản phẩm
					</Title>
					<Button
						icon={<Plus color="white" size={20} />}
						type="primary"
						onClick={onOpen}
						shape="circle"
						data-testid="btnCreateProduct"
					/>
				</Flex>
				{/* Add more product  */}
				{product_categories && collections && (
					<ProductModal
						type="supplier"
						state={state}
						handleOk={onClose}
						handleCancel={handleCloseModal}
						product={currentProduct}
						productCategories={product_categories}
						productCollections={collections}
					/>
				)}
			</Col>
			<Col span={18}>
				<Input
					placeholder="Nhập tên sản phẩm"
					className="w-full text-xs"
					size="small"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
				/>
			</Col>
			<Col span={6}>
				{defaultRegion && (
					<Select
						placeholder="Chọn khu vực"
						onChange={handleRegionChange}
						options={regions?.map((region) => ({
							label: region.name,
							value: region.id,
						}))}
						value={regionId}
						className="w-full"
					/>
				)}
			</Col>
			<Col span={24} id="table-product">
				<Table
					loading={isLoading}
					rowSelection={{
						type: 'checkbox',
						selectedRowKeys: selectedProducts,
						onChange: handleRowSelectionChange,
						preserveSelectedRowKeys: true,
					}}
					columns={columns as any}
					dataSource={variants ?? []}
					rowKey="id"
					pagination={{
						total: count,
						pageSize: PAGE_SIZE,
						current: currentPage,
						onChange: handleChangePage,
						showSizeChanger: false,
					}}
					scroll={{ x: 700 }}
				/>
			</Col>
			<Col span={24}>
				<Flex justify="flex-end" gap="small" className="mt-4">
					<Button type="default" onClick={handleCancel}>
						Huỷ
					</Button>
					<Button onClick={onSubmit} data-testid="next-step">
						Tiếp tục
					</Button>
				</Flex>
			</Col>
		</Row>
	);
};

export default ProductForm;
