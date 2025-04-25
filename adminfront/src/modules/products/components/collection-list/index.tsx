'use client';
import { Product, ProductCollection } from '@medusajs/medusa';
import { Modal, message } from 'antd';
import _ from 'lodash';
import { CircleAlert, Plus, Search } from 'lucide-react';
import {
	useAdminAddProductsToCollection,
	useAdminCollections,
	useAdminDeleteCollection,
	useAdminRemoveProductsFromCollection,
} from 'medusa-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';

import { FloatButton } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import {
	AddProductModal,
	CollectionModal,
	ManageProductModal,
} from '@/modules/products/components/collection-modal';
import collectionColumns from './CollectionColumn';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const CollectionList: FC<Props> = ({}) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const {
		state: stateProduct,
		onOpen: onOpenProduct,
		onClose: onCloseProduct,
	} = useToggleState(false);

	const {
		state: stateAddProduct,
		onOpen: onOpenAddProduct,
		onClose: onCloseAddProduct,
	} = useToggleState(false);

	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentCollection, setCurrentCollection] = useState<any>(null);
	const [collectionId, setCollectionId] = useState<string>('');

	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');

	const deleteCollection = useAdminDeleteCollection(collectionId);
	// Action with product from collection
	const addProducts = useAdminAddProductsToCollection(currentCollection?.id);
	const removeProducts = useAdminRemoveProductsFromCollection(
		currentCollection?.id
	);

	const { collections, isLoading, isRefetching, count } = useAdminCollections(
		{
			q: searchValue || undefined,
			limit: DEFAULT_PAGE_SIZE,
			offset: offset,
		},
		{
			keepPreviousData: true,
		}
	);

	// manage and add product modal

	const handleEditCollection = (data: ProductCollection) => {
		setCurrentCollection(data);
		onOpen();
	};

	const handleProductCollection = (data: ProductCollection) => {
		setCurrentCollection(data);
		onOpenProduct();
	};

	const handleAddProduct = (data: ProductCollection) => {
		setCurrentCollection(data);
		onOpenAddProduct();
	};

	const handleDeleteCollection = (collectionId: ProductCollection['id']) => {
		setCollectionId(collectionId);
		if (collectionId) {
			Modal.confirm({
				title: 'Bạn có muốn xoá bộ sưu tập này không ?',
				content:
					'Bộ sưu tập sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá bộ sưu tập này chứ?',
				icon: (
					<CircleAlert
						style={{ width: 32, height: 24 }}
						className="mr-2"
						color="#E7B008"
					/>
				),
				okType: 'danger',
				okText: 'Đồng ý',
				cancelText: 'Huỷ',
				async onOk() {
					deleteCollection.mutateAsync(void 0, {
						onSuccess: () => {
							message.success('Xóa bộ sưu tập thành công.');
							setCollectionId('');
							return;
						},
						onError: (error) => {
							message.error(getErrorMessage(error));
							return;
						},
					});
				},
				// confirmLoading: deleteCollection.isLoading,
				onCancel() {
					setCollectionId('');
				},
			});
		}
	};

	const handleCloseModal = () => {
		setCurrentCollection(null);
		onClose();
	};

	const handleCloseProduct = () => {
		setCurrentCollection(null);
		onCloseProduct();
	};

	const handleCloseAddProduct = () => {
		setCurrentCollection(null);
		onCloseAddProduct();
	};

	const columns = useMemo(() => {
		return collectionColumns({
			handleEditCollection,
			handleDeleteCollection,
			handleProductCollection,
			handleAddProduct,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collections]);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleAddProducts = async (selectedRowIds: string[]) => {
		const currentCollectionIds = currentCollection?.products?.map(
			(product: Product) => product?.id
		);

		// Close add product modal when no change
		if (_.isEqual(currentCollectionIds, selectedRowIds)) {
			handleCloseAddProduct();
			return;
		}
		// const currentCollection
		try {
			// Find the difference between the selected products and the current products
			const updateCollectionIds = _.difference(
				selectedRowIds,
				currentCollectionIds
			);
			const deleteCollectionIds = _.difference(
				currentCollectionIds,
				selectedRowIds
			);

			if (updateCollectionIds?.length) {
				await addProducts.mutateAsync(
					{ product_ids: updateCollectionIds },
					{
						onError: (error) => {
							message.error(getErrorMessage(error));
							return;
						},
					}
				);
			}
			if (deleteCollectionIds?.length) {
				await removeProducts.mutateAsync(
					{ product_ids: deleteCollectionIds },
					{
						onError: (error) => {
							message.error(getErrorMessage(error));
							return;
						},
					}
				);
			}
			message.success('Cập nhật bộ sưu tập thành công.');
			handleCloseAddProduct();
			return;
		} catch (error) {
			message.error(getErrorMessage(error));
			return;
		}
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;

			// Update search query
			setSearchValue(inputValue);
		},
		500
	);

	return (
		<>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Quản lý bộ sưu tập</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					placeholder="Tìm kiếm bộ sưu tập..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={collections ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} bộ sưu tập`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} />}
				type="primary"
				onClick={onOpen}
				// data-testid="btnCreateProduct"
			/>
			<CollectionModal
				state={state}
				handleOk={onClose}
				handleCancel={handleCloseModal}
				collection={currentCollection}
			/>
			<AddProductModal
				state={stateAddProduct}
				handleOk={onCloseAddProduct}
				onSubmit={handleAddProducts}
				handleCancel={handleCloseAddProduct}
				collection={currentCollection}
			/>
			{currentCollection && (
				<ManageProductModal
					state={stateProduct}
					handleOk={onCloseProduct}
					handleCancel={handleCloseProduct}
					collection={currentCollection}
				/>
			)}
		</>
	);
};

export default CollectionList;
