'use client';

import {
	AdminPostProductsReq,
	Product,
	ProductCategory,
	ProductCollection,
	Region,
} from '@medusajs/medusa';
import { Form, message, type CollapseProps, type FormProps } from 'antd';
import { Minus, Plus } from 'lucide-react';
import { useAdminCreateProduct, useAdminRegions } from 'medusa-react';
import { useRouter } from 'next/navigation';

import { splitFiles } from '@/actions/images';
import { Collapse } from '@/components/Collapse';
import { Flex } from '@/components/Flex';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { useFeatureFlag } from '@/lib/providers/feature-flag-provider';
import { getErrorMessage } from '@/lib/utils';
import { NewProductForm, ProductStatus } from '@/types/products';
import { ERoutes } from '@/types/routes';
import { persistedPrice } from '@/utils/prices';
import {
	AttributeForm,
	GeneralForm,
	MediaForm,
	OrganizeForm,
	ThumbnailForm,
} from './components';
import { AddVariant } from './components/variant-form';

interface Props {
	type?: string;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	product: Product | null;
	productCategories: ProductCategory[];
	productCollections: ProductCollection[];
}

export default function ProductModal({
	type = 'create',
	state: stateModal,
	handleOk,
	handleCancel,
	product,
	productCategories,
	productCollections,
}: Props) {
	const router = useRouter();
	const { isFeatureEnabled } = useFeatureFlag();
	const { mutateAsync, isLoading } = useAdminCreateProduct();
	const uploadFile = useAdminUploadFile();

	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const { regions: storeRegions } = useAdminRegions({
		limit: 1000,
	});

	const titleModal = 'Thêm mới sản phẩm';

	// handle form submit
	const onFinish: FormProps<NewProductForm>['onFinish'] = async (values) => {
		// Payload
		const payload = createPayload(
			values,
			true,
			isFeatureEnabled('sales_channels'),
			storeRegions || []
		);

		// Prepped images thumbnail
		if (values.thumbnail?.length) {
			const { uploadImages } = splitFiles(values?.thumbnail, null);
			await uploadFile.mutateAsync(
				{
					files: uploadImages,
					prefix: 'product',
				},
				{
					onSuccess: ({ uploads }) => {
						const urls = uploads.map((img) => img.url);
						payload.thumbnail = urls[0];
					},
					onError: (error) => {
						messageApi.open({
							type: 'error',
							content: getErrorMessage(error),
						});
					},
				}
			);
		}
		// Prepped images media
		if (values.media?.length) {
			const { uploadImages } = splitFiles(values?.media, null);
			await uploadFile.mutateAsync(
				{
					files: uploadImages,
					prefix: 'product',
				},
				{
					onSuccess: ({ uploads }) => {
						const urls = uploads.map((img) => img.url);
						payload.images = urls;
					},
					onError: (error) => {
						messageApi.open({
							type: 'error',
							content: getErrorMessage(error),
						});
					},
				}
			);
		}

		await mutateAsync(payload, {
			onSuccess: ({ product }) => {
				messageApi.open({
					type: 'success',
					content: 'Thêm sản phẩm thành công.',
				});
				handleOk();
				type === 'create' && router.push(`${ERoutes.PRODUCTS}/${product.id}`);
				return null;
			},
			onError: (error: any) => {
				messageApi.open({
					type: 'error',
					content: getErrorMessage(error),
				});
			},
		});
	};

	// recursive function to convert categories to tree data
	const convertCategoriesToTreeData = (categories: any) => {
		return categories.map((category: any) => {
			const { id, name, category_children } = category;
			const children =
				category_children.length > 0
					? convertCategoriesToTreeData(category_children)
					: [];

			return {
				title: name,
				value: id,
				id: id,
				children,
			};
		});
	};

	const treeData = convertCategoriesToTreeData(productCategories);

	const itemsCollapse: CollapseProps['items'] = [
		{
			key: 'generalForm',
			label: (
				<Flex>
					<div>{'Thông tin chung'}</div>
					<div className="text-rose-600 text-xl">{'*'}</div>
				</Flex>
			),
			children: <GeneralForm />,
		},
		{
			key: 'organizeForm',
			label: 'Phân loại',
			children: (
				<OrganizeForm
					treeCategories={treeData}
					productCollections={productCollections}
				/>
			),
		},
		{
			key: 'variantForm',
			label: 'Biến thể',
			children: <AddVariant form={form} />,
		},
		{
			key: 'attributeForm',
			label: 'Đặc điểm',
			children: <AttributeForm />,
		},
		{
			key: 'thumbnailForm',
			label: 'Ảnh đại diện',
			children: <ThumbnailForm form={form} />,
		},
		{
			key: 'imageForm',
			label: 'Hình ảnh',
			children: <MediaForm form={form} />,
		},
	];

	return (
		<SubmitModal
			open={stateModal}
			onOk={handleOk}
			confirmLoading={isLoading}
			handleCancel={handleCancel}
			width={800}
			form={form}
			isLoading={isLoading}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{titleModal}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-3">
				<Collapse
					className="bg-white [&_.ant-collapse-header]:px-0 [&_.ant-collapse-header]:py-4 [&_.ant-collapse-header]:text-base [&_.ant-collapse-header]:font-medium"
					defaultActiveKey={['generalForm']}
					// ghost
					items={itemsCollapse}
					expandIconPosition="end"
					bordered={false}
					expandIcon={({ isActive }) =>
						isActive ? <Minus size={20} /> : <Plus size={20} />
					}
				/>
			</Form>
		</SubmitModal>
	);
}

const createPayload = (
	data: NewProductForm,
	publish = true,
	salesChannelsEnabled = false,
	storeRegions: Region[]
): AdminPostProductsReq => {
	const payload: AdminPostProductsReq = {
		// General
		title: data?.general?.title,
		subtitle: data?.general?.subtitle || undefined,
		material: data?.general?.material || undefined,
		handle: data?.general?.handle || undefined,
		description: data?.general?.description || undefined,
		discountable: data?.general?.discounted,
		is_giftcard: false,
		// Organize
		collection_id: (data?.organize?.collection as any) || undefined,
		categories: data?.organize?.categories?.length
			? data.organize.categories.map((id) => ({ id }))
			: undefined,
		tags: data?.organize?.tags
			? data.organize.tags.map((t) => ({
					value: t,
			  }))
			: undefined,
		type: data?.organize?.type
			? {
					value: data.organize.type.label,
					id: data.organize.type.value,
			  }
			: undefined,
		// Options
		options: data?.options?.length
			? data.options.map((o) => ({
					title: o.title,
			  }))
			: undefined,
		// Variants
		variants: data?.variants?.map((v) => ({
			title: v?.title!,
			options: v?.options,
			material: undefined,
			sku: v?.sku || undefined,
			inventory_quantity: v?.inventory_quantity || 0,
			ean: v?.ean || undefined,
			upc: v?.upc || undefined,
			barcode: v?.barcode || undefined,
			manage_inventory: v?.manage_inventory || true,
			allow_backorder: v?.allow_backorder || false,
			// prices: getVariantPrices(v.prices),
			width: v?.width || undefined,
			length: v?.length || undefined,
			height: v?.height || undefined,
			weight: v?.weight || undefined,
			hs_code: v?.hs_code || undefined,
			mid_code: v?.mid_code || undefined,
			origin_country: v?.origin_country || undefined,
			supplier_price: +persistedPrice('vnd', v?.supplier_price ?? 0),
			prices: v?.prices?.length
				? (v?.prices
						?.map((price) => {
							if (typeof price.amount !== 'number') {
								return null;
							}
							const taxRegion = storeRegions?.find(
								(region) => region.currency_code === price.currency_code
							);
							const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;
							const amount = price.amount / (1 + taxRate / 100);
							return {
								amount: +persistedPrice(price?.currency_code ?? 'vnd', amount),
								currency_code: price?.currency_code ?? 'vnd',
							};
						})
						.filter((item: any) => !!item) as any)
				: [],
		})),
		// Dimensions
		width: data?.dimensions?.width || undefined,
		length: data?.dimensions?.length || undefined,
		height: data?.dimensions?.height || undefined,
		weight: data?.dimensions?.weight || undefined,
		// Customs
		hs_code: data?.customs?.hs_code || undefined,
		mid_code: data?.customs?.mid_code || undefined,
		origin_country: (data?.customs?.origin_country as any) || undefined,

		// @ts-ignore
		status: publish ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
	};

	return payload;
};

// const getVariantPrices = (prices: PricesFormType) => {
// 	const priceArray = prices.prices
// 		.filter((price) => typeof price.amount === 'number')
// 		.map((price) => {
// 			return {
// 				amount: price.amount as number,
// 				currency_code: price.region_id ? undefined : price.currency_code,
// 				region_id: price.region_id || undefined,
// 			};
// 		});

// 	return priceArray;
// };
