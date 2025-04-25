'use client';
import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { useAdminDeleteWarehouse } from '@/lib/hooks/api/warehouse';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { useProductUnit } from '@/lib/providers/product-unit-provider';
import { getErrorMessage } from '@/lib/utils';
import { Warehouse, WarehouseInventory } from '@/types/warehouse';
import { Modal as AntdModal, message } from 'antd';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { useAdminVariants } from 'medusa-react';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import ModalAddVariantWarehouse from '../components/modal-add-variant-warehouse';
import ModalVariantInventory from '../components/modal-variant-inventory';
import { expandedColumns, productColumns } from './product-columns';
import { ProductVariant } from '@/types/products';
import ModalAddVariant from '../components/modal-add-variant';

type Props = {};

const DEFAULT_PAGE_SIZE = 20;

const ProductManage: FC<Props> = ({}) => {
	const { setSelectedUnit, setQuantity } = useProductUnit();
	const {
		state: stateInventory,
		onOpen: openInventory,
		onClose: closeInventory,
	} = useToggleState(false);
	const {
		state: stateVariantInventory,
		onOpen: openVariantInventory,
		onClose: closeVariantInventory,
	} = useToggleState(false);

	const [inventoryType, setInventoryType] = useState<string>('');
	const [variant, setVariant] = useState<ProductVariant>();
	const [warehouseInventory, setWarehouseInventory] =
		useState<WarehouseInventory>();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	const { variants, isLoading, count, refetch } = useAdminVariants({
		q: searchValue || undefined,
		limit: DEFAULT_PAGE_SIZE,
		offset: offset,
		expand: 'product,inventories,inventories.item_unit,inventories.warehouse',
	});

	useEffect(() => {
		if (variants?.length) {
			const keys = variants.map((item) => item.id);
			setExpandedKeys(keys as string[]);
		}
	}, [variants]);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleEditWarehouse = (item: ProductVariant) => {
		console.log('item:', item);
		setQuantity(1);
		setVariant(item);
		openVariantInventory();
	};
	const columns = productColumns({
		handleEditWarehouse,
	});

	// Add variant inventory
	const handleAddInventory = (item: WarehouseInventory) => {
		item && item.item_unit && setSelectedUnit(item.item_unit.id);
		setQuantity(1);
		setWarehouseInventory(item);
		setInventoryType('INBOUND');
		openInventory();
	};
	// Remove variant inventory
	const handleRemoveInventory = (item: WarehouseInventory) => {
		item && item.item_unit && setSelectedUnit(item.item_unit.id);
		setQuantity(1);
		setWarehouseInventory(item);
		setInventoryType('OUTBOUND');
		openInventory();
	};

	// Close modal variant inventory
	const handleCloseModal = () => {
		closeInventory();
		setInventoryType('');
		setQuantity(1);
		setWarehouseInventory(undefined);
	};

	const expandColumns = expandedColumns({
		handleAddInventory,
		handleRemoveInventory,
	});

	const expandedRowRender = (record: Warehouse) => {
		if (!record.inventories?.length) return null;

		return (
			<Table
				columns={expandColumns as any}
				dataSource={record.inventories}
				rowKey="id"
				pagination={false}
			/>
		);
	};

	return (
		<Flex vertical gap={12}>
			<Flex align="center" justify="flex-end" className="py-4">
				<Input
					placeholder="Tìm kiếm vị trí hoặc sản phẩm..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px] mr-2"
				/>
				<Button
					type="dashed"
					onClick={() => {
						setExpandedKeys((prev) =>
							prev.length
								? []
								: (variants?.map((item) => item.id) as string[]) || []
						);
					}}
				>
					{expandedKeys.length ? 'Ẩn vị trí' : 'Hiển thị vị trí'}
				</Button>
			</Flex>
			<Table
				dataSource={variants}
				expandable={{
					expandedRowRender: expandedRowRender as any,
					expandedRowKeys: expandedKeys,
					onExpandedRowsChange: (keys) => {
						setExpandedKeys(keys as string[]);
					},
				}}
				loading={isLoading}
				rowKey="id"
				columns={columns as any}
				pagination={
					(count ?? 0) > DEFAULT_PAGE_SIZE && {
						onChange: (page) => handleChangePage(page),
						pageSize: DEFAULT_PAGE_SIZE,
						current: numPages || 1,
						total: count,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} sản phẩm`,
					}
				}
			/>
			{variant && (
				<ModalAddVariant
					isModalOpen={stateVariantInventory}
					onClose={closeVariantInventory}
					variant={variant}
					refetch={refetch}
				/>
			)}
			{warehouseInventory && (
				<ModalVariantInventory
					isModalOpen={stateInventory}
					inventoryType={inventoryType}
					onClose={handleCloseModal}
					warehouseInventory={warehouseInventory}
					refetch={refetch}
				/>
			)}
		</Flex>
	);
};

export default ProductManage;
