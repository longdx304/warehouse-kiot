import { Product, ProductStatus } from '@medusajs/medusa';
import { Col, Row, message } from 'antd';
import { Dot, Pencil } from 'lucide-react';
import {
	useAdminCollections,
	useAdminProductCategories,
	useAdminSalesChannels,
	useAdminUpdateProduct,
} from 'medusa-react';
import { FC, useEffect, useState } from 'react';

import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Select } from '@/components/Select';
import { Tag } from '@/components/Tag';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import GeneralModal from './edit-modals/GeneralModal';

type Props = {
	product: Product;
	loadingProduct: boolean;
};

const GeneralInfo: FC<Props> = ({ product, loadingProduct }) => {
	const updateProduct = useAdminUpdateProduct(product?.id);
	const [statusValue, setStatusValue] = useState<string | undefined>(
		product?.status
	);
	const { state, onOpen, onClose } = useToggleState(false);
	const { product_categories, isLoading: isLoadingCategory } =
		useAdminProductCategories({
			parent_category_id: 'null',
			include_descendants_tree: true,
			is_internal: false,
		});
	const { collections, isLoading: isLoadingCollection } = useAdminCollections();

	useEffect(() => {
		setStatusValue(product?.status);
	}, [product]);

	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa thông tin</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
			onClick: onOpen,
		},
	];

	// const handleMenuClick: MenuProps['onClick'] = ({ key }) => {};

	// recursive function to convert categories to tree data
	const convertCategoriesToTreeData = (categories: any) => {
		return (
			categories?.map((category: any) => {
				const { id, name, category_children } = category;
				const children =
					category_children?.length > 0
						? convertCategoriesToTreeData(category_children)
						: [];

				return {
					title: name,
					value: id,
					id: id,
					children,
				};
			}) || []
		);
	};

	const treeData = convertCategoriesToTreeData(product_categories);

	const onChangeStatus = (value: ProductStatus) => {
		updateProduct.mutateAsync(
			{ status: value },
			{
				onSuccess: () => {
					setStatusValue(value);
					message.success('Cập nhật trạng thái thành công');
				},
				onError: () => {
					message.error('Cập nhật trạng thái thất bại');
				},
			}
		);
	};

	return (
		<Card
			loading={loadingProduct || isLoadingCategory || isLoadingCollection}
			className="p-4"
		>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Flex align="center" justify="space-between" className="flex-wrap">
						<Title level={3}>{product?.title}</Title>
						<Flex
							align="center"
							justify="flex-end"
							gap="40px"
							className="max-[390px]:w-full"
						>
							<Select
								value={statusValue}
								suffixIcon={null}
								variant="borderless"
								className="w-[140px] hover:bg-gray-200 rounded-md"
								onChange={onChangeStatus}
								options={[
									{
										value: 'published',
										label: (
											<Flex justify="flex-start" align="center" gap="2px">
												<Dot
													color="rgb(52 211 153)"
													size={20}
													className="w-[20px]"
												/>
												<Text>{'Đã xuất bản'}</Text>
											</Flex>
										),
									},
									{
										value: 'draft',
										label: (
											<Flex justify="flex-start" align="center" gap="2px">
												<Dot
													color="rgb(156 163 175)"
													size={20}
													className="w-[20px]"
												/>
												<Text>{'Bản nháp'}</Text>
											</Flex>
										),
									},
								]}
							/>
							<ActionAbles actions={actions} onMenuClick={() => {}} />
						</Flex>
					</Flex>
				</Col>
				<Col span={24}>
					<ProductTags product={product} />
					<ProductDetail product={product} />
					<ProductSalesChannels product={product} />
				</Col>
				<Col span={24}></Col>
			</Row>
			<GeneralModal
				state={state}
				handleOk={onClose}
				handleCancel={onClose}
				product={product}
				treeData={treeData}
				collections={collections || []}
			/>
		</Card>
	);
};

export default GeneralInfo;

const ProductTags = ({ product }: { product: Product }) => {
	if (product?.tags?.length === 0) {
		return null;
	}

	return (
		<Flex align="center" justify="flex-start" className="my-4 flex flex-wrap">
			{product?.tags?.map((t) => (
				<Tag
					key={t.id}
					bordered={false}
					className="w-fit py-2 px-3 text-xs text-gray-500 bg-gray-100 font-semibold rounded-md"
				>
					{t.value}
				</Tag>
			))}
		</Flex>
	);
};

const ProductDetail = ({ product }: { product: Product }) => {
	return (
		<>
			<Flex vertical gap="8px">
				<Text className="text-sm text-gray-500">{'Mô tả'}</Text>
				<Text className="text-sm font-semibold">{'Chi tiết'}</Text>
			</Flex>
			<Flex vertical gap="8px" className="w-full pt-4">
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Tiêu đề phụ'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.subtitle || '-'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Định danh'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.handle || '-'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Loại'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.type?.value || '-'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Bộ sưu tập'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.collection?.title || '-'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Danh mục'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.categories?.map((c) => c.name).join(', ') || '-'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Có thể giảm giá'}</Text>
					<Text className="text-sm text-gray-500">
						{product?.discountable ? 'Có' : 'Không'}
					</Text>
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					gap="small"
					className="w-full"
				>
					<Text className="text-sm text-gray-500">{'Dữ liệu kỹ thuật'}</Text>
					<Text className="text-sm text-gray-500">{'-'}</Text>
				</Flex>
			</Flex>
		</>
	);
};

const ProductSalesChannels = ({ product }: { product: Product }) => {
	const { count } = useAdminSalesChannels();
	// const remainder = Math.max(product?.sales_channels?.length - 3, 0)
	return (
		<Flex vertical gap="8px" className="pt-4">
			<Text className="text-sm font-semibold">{'Các kênh bán hàng'}</Text>
			<Flex gap="middle">
				{product?.sales_channels?.map((channel) => (
					<Tag key={channel.id} className="w-fit py-2 px-3 text-xs">
						{channel.name}
					</Tag>
				))}
			</Flex>
			<Text className="text-sm text-gray-500">{`Có sẵn trong ${
				product?.sales_channels?.length || 0
			} trong tổng số ${count} Kênh bán hàng`}</Text>
		</Flex>
	);
};
