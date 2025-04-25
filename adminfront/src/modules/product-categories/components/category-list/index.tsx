'use client';
import { ProductCategory } from '@medusajs/medusa';
import { Divider, Modal, message } from 'antd';
import _ from 'lodash';
import { ChevronDown, CircleAlert, GripVertical, Plus } from 'lucide-react';
import {
	useAdminDeleteProductCategory,
	useAdminProductCategories,
	useMedusa,
} from 'medusa-react';
import { useCallback, useMemo, useState } from 'react';
import Nestable from 'react-nestable';
import 'react-nestable/dist/styles/index.css';
import '../../styles/product-categories.css';

import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import CategoryItem from '../category-item';
import CategoryModal from '../category-modal';



const CategoryList = () => {
	const { client } = useMedusa();
	const { state, onOpen, onClose } = useToggleState(false);
	const [isUpdating, enableUpdating, disableUpdating] = useToggleState(false);
	const [isError, enableError, disableError] = useToggleState(false);
	const [currentCategory, setCurrentCategory] =
		useState<ProductCategory | null>(null);
	const [parentCategory, setParentCategory] = useState<ProductCategory | null>(
		null
	);
	const [categoryId, setCategoryId] = useState<string | null>(null);

	const {
		product_categories: data,
		isLoading,
		refetch,
		isRefetching,
	} = useAdminProductCategories({
		parent_category_id: 'null',
		include_descendants_tree: true,
	});
	const deleteCategory = useAdminDeleteProductCategory(categoryId!);

	// Handle move item category
	const onItemDrop = useCallback(
		async (params: {
			item: ProductCategory;
			items: ProductCategory[];
			path: number[];
		}) => {
			enableUpdating();
			let parentId = null;

			const { dragItem, items, targetPath }: any = params;
			const [rank] = targetPath.slice(-1);

			if (targetPath.length > 1) {
				const path = _.dropRight(
					_.flatMap(targetPath.slice(0, -1), (item) => [
						item,
						'category_children',
					])
				);

				const newParent = _.get(items, path);
				parentId = newParent.id;
			}

			try {
				disableError();
				// Update category when drag & drop
				await client.admin.productCategories.update(dragItem.id, {
					parent_category_id: parentId,
					rank,
				});
				message.success('Cập nhật danh mục này thành công.');
			} catch (e) {
				message.error('Cập nhật danh mục này thất bại.');
				enableError();
			} finally {
				// await queryClient.invalidateQueries(adminProductCategoryKeys.lists())
				disableUpdating();
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	//Handle create sub category
	const handleCreateSubCategory = (parentCategory: ProductCategory) => {
		setParentCategory(parentCategory);
		onOpen();
	};

	// Handle edit category
	const handleEditCategory = (record: ProductCategory) => {
		setCurrentCategory(record);
		setParentCategory(record);
		onOpen();
	};

	const handleDeleteCategory = async (categoryId: ProductCategory['id']) => {
		setCategoryId(categoryId);
		Modal.confirm({
			title: 'Bạn có muốn xoá danh mục này không ?',
			content:
				'Danh mục sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá danh mục này chứ?',
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
				await deleteCategory.mutateAsync(void 0, {
					onSuccess: () => {
						setCategoryId(null);
						message.success('Xoá danh mục thành công');
					},
					onError: () => {
						message.error('Xoá danh mục thất bại');
					},
				});
			},
			onCancel() {
				setCategoryId(null);
			},
		});
	};

	// Table Drag & Drop Categories
	const NestableList = useMemo(
		() => (
			<Nestable
				// item={data}
				items={data as any as ProductCategory[]}
				collapsed={true}
				onChange={onItemDrop as any}
				childrenProp="category_children"
				// Adding an unreasonably high number here to prevent us from
				// setting a hard limit  on category depth. This should be decided upon
				// by consumers of medusa after considering the pros and cons to the approach
				maxDepth={99}
				renderItem={({ item, depth, handler, collapseIcon }) => (
					<CategoryItem
						item={item as ProductCategory}
						depth={depth}
						handler={handler}
						collapseIcon={collapseIcon}
						handleCreateSubCategory={handleCreateSubCategory}
						handleEdit={handleEditCategory}
						handleDelete={handleDeleteCategory}
					/>
				)}
				handler={<GripVertical className="cursor-grab" color="#889096" />}
				renderCollapseIcon={({ isCollapsed }) => (
					<ChevronDown
						style={{
							top: -2,
							width: 32,
							left: -12,
							transform: !isCollapsed ? '' : 'rotate(270deg)',
						}}
						color="#889096"
						size={18}
					/>
				)}
			/>
		),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[data, isError]
	);

	const handleCloseModal = () => {
		setCurrentCategory(null);
		onClose();
	};

	return (
		<Card className="w-full px-4 py-2" loading={isLoading || isRefetching}>
			{/* Title */}
			<Title level={4}>Danh mục sản phẩm</Title>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={() => {
					setParentCategory(null); 
					onOpen(); 
				}}
				data-testid="btnAddCategories"
			/>
			{/* Table categories */}
			<Divider />
			<div
				style={{
					pointerEvents: isUpdating ? 'none' : 'initial',
					position: 'relative',
				}}
			>
				{NestableList}
				{isUpdating && (
					<div
						style={{
							top: 0,
							bottom: 0,
							width: '100%',
							cursor: 'progress',
							position: 'absolute',
						}}
					/>
				)}
			</div>
			<CategoryModal
				stateModal={state}
				handleOk={onClose}
				handleCancel={handleCloseModal}
				category={currentCategory}
				parentCategory={parentCategory}
				categories={data as any as ProductCategory[]}
				refetch={refetch}
			/>
		</Card>
	);
};

export default CategoryList;
