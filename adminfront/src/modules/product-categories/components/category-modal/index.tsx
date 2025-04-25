'use client';

import { Breadcrumb } from '@/components/Breadcrumb';
import { Input, TextArea } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Title } from '@/components/Typography';
import { ProductCategory } from '@medusajs/medusa';
import { Col, Form, message, Row, type FormProps } from 'antd';
import _ from 'lodash';
import { CircleAlert, Highlighter } from 'lucide-react';
import {
	useAdminCreateProductCategory,
	useAdminDeleteFile,
	useAdminUpdateProductCategory,
} from 'medusa-react';
import React, { useEffect } from 'react';
// import { TCategoryRequest } from '@/types/productCategories';
import { splitFiles } from '@/actions/images';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { getErrorMessage } from '@/lib/utils';
import { ThumbnailForm } from '@/modules/products/components/products-modal/components';
import { ThumbnailFormType } from '@/types/products';
import { useMemo } from 'react';

interface Props {
	stateModal: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	category: ProductCategory | null;
	parentCategory: ProductCategory | null;
	categories: ProductCategory[];
	refetch: () => void;
}

type ExtendedProductCategory = ProductCategory & {
	thumbnail: ThumbnailFormType;
};

type TCategoryRequest = Partial<ExtendedProductCategory>;

type TCategoryRequestWithThumbnail = TCategoryRequest & {
	thumbnail: ThumbnailFormType;
};

const CategoryModal: React.FC<Props> = ({
	stateModal,
	handleOk,
	handleCancel,
	category,
	parentCategory,
	categories,
	refetch,
}) => {
	const createCategory = useAdminCreateProductCategory();
	const updateCategory = useAdminUpdateProductCategory(category?.id ?? '');
	const [form] = Form.useForm();
	const uploadFile = useAdminUploadFile();
	const deleteFile = useAdminDeleteFile();

	const titleModal = `${
		_.isEmpty(category) ? 'Thêm mới' : 'Cập nhật'
	} danh mục sản phẩm`;

	useEffect(() => {
		form &&
			form?.setFieldsValue({
				name: category?.name ?? '',
				handle: category?.handle ?? '',
				description: category?.description ?? '',
				is_active: category?.is_active ?? true,
				is_internal: category?.is_internal ?? false,
				thumbnail: category?.metadata?.thumbnail || null,
			});
	}, [category, form]);

	// Get tree category
	const getAncestors = (targetNode: any, nodes: any, acc = []) => {
		let parentCategory = null;

		acc.push(targetNode as never);

		if (targetNode.parent_category_id) {
			parentCategory = nodes.find(
				(n: any) => n.id === targetNode.parent_category_id
			);

			acc = getAncestors(parentCategory, nodes, acc);
		}

		if (!parentCategory) {
			return acc.reverse();
		}

		return acc;
	};

	// Show list ancestors to Breadcrumb
	const ancestors = useMemo(() => {
		const result = parentCategory && getAncestors(parentCategory, categories);
		if (_.isEmpty(result)) return [];
		const newResult = result?.map((item: ProductCategory) => ({
			title: item.name,
		}));

		if (_.isEmpty(category) && newResult) {
			newResult.push({ title: 'Danh mục mới' });
		}

		return newResult;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parentCategory, categories]);

	const handleDeleteFile = async (url: string) => {
		const fileKey = new URL(url).pathname.slice(1);
		await deleteFile.mutateAsync({ file_key: fileKey });
	};
	// Submit form
	const onFinish: FormProps<TCategoryRequestWithThumbnail>['onFinish'] = async (
		values
	) => {
		let newImages: any = [];
		// Upload the thumbnail image if it exists
		if (values.thumbnail && values.thumbnail.length > 0) {
			try {
				const oldImg = category?.metadata?.thumbnail
					? [category.metadata.thumbnail as string]
					: null;
				const { uploadImages, existingImages, deleteImages } = splitFiles(
					values?.thumbnail,
					oldImg
				);
				newImages = [...existingImages];
				if (uploadImages?.length) {
					const { uploads } = await uploadFile.mutateAsync({
						files: uploadImages,
						prefix: 'categories',
					});
					newImages = [...newImages, ...uploads];
				}
				if (deleteImages?.length) {
					await deleteFile.mutateAsync({ file_key: deleteImages });
				}
			} catch (error) {
				message.error('Đã xảy ra lỗi khi tải hình ảnh lên.');
				return;
			}
		}

		// The payload with the thumbnail image in metadata
		const payload: Record<string, unknown> = {
			...values,
			parent_category_id: category
				? category.parent_category_id
				: parentCategory?.id ?? null,
			metadata: {
				...(category?.metadata || {}),
				thumbnail: newImages.length > 0 ? newImages[0].url : '',
			},
		};

		delete payload.thumbnail;
		if (_.isEmpty(category)) {
			await createCategory.mutateAsync(payload as any, {
				onSuccess: () => {
					message.success('Đăng ký danh mục sản phẩm thành công');
					refetch();
					handleCancel();
				},
				onError: (error: any) => {
					// message.error('Đăng ký danh mục sản phẩm thất bại');
					message.error(getErrorMessage(error));
					return;
				},
			});
		} else {
			// Update user
			await updateCategory.mutateAsync(payload as any, {
				onSuccess: () => {
					if (!!category?.metadata?.thumbnail) {
						handleDeleteFile(category?.metadata?.thumbnail as string);
					}
					message.success('Cập nhật danh mục sản phẩm thành công');
					refetch();
					handleCancel();
				},
				onError: (error: any) => {
					// message.error('Cập nhật danh mục sản phẩm thất bại');
					message.error(getErrorMessage(error));
					return;
				},
			});
		}
	};

	return (
		<SubmitModal
			open={stateModal}
			onOk={handleOk}
			isLoading={createCategory?.isLoading || updateCategory?.isLoading}
			handleCancel={handleCancel}
			form={form}
		>
			<Title level={3} className="text-center pb-2">
				{titleModal}
			</Title>
			{!_.isEmpty(ancestors) && (
				<div className="py-2" data-testid="breadcrumbCategory">
					<Breadcrumb items={ancestors} />
				</div>
			)}
			<Form
				id="form-category"
				form={form}
				onFinish={onFinish}
				// onFinishFailed={onFinishFailed}
			>
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="name"
							rules={[{ required: true, message: 'Tên không đúng định dạng' }]}
							label="Tên danh mục:"
						>
							<Input
								placeholder="Đặt tên cho danh mục này"
								prefix={<Highlighter />}
								data-testid="name"
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="handle"
							rules={[
								{
									pattern: /^[A-Za-z0-9-_]+$/,
									message: 'Url không được có dấu hoặc khoảng trắng.',
								},
							]}
							label="Tiêu đề URL"
							tooltip={{
								title:
									'URL Slug cho danh mục. Sẽ được tự động tạo nếu để trống',
								icon: <CircleAlert size={18} />,
							}}
						>
							<Input
								placeholder="Đặt tên cho danh mục này"
								prefix={<span className="text-gray-300">{'/'}</span>}
								data-testid="name"
							/>
						</Form.Item>
					</Col>
					<Col span={24}>
						<ThumbnailForm form={form} />
					</Col>

					<Col span={24}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="description"
							// rules={[{ required: true, message: 'Tên phải có ít nhất 2 ký tự!' }]}
							label="Mô tả:"
						>
							<TextArea
								placeholder="Đặt mô tả cho danh mục này"
								data-testid="description"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="is_active"
							// rules={[{ required: true, message: 'Tên phải có ít nhất 2 ký tự!' }]}
							label="Trạng thái:"
						>
							<Select
								data-testid="is_active"
								options={[
									{ value: true as any, label: 'Hoạt động' },
									{ value: false, label: 'Không hoạt động' },
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="is_internal"
							// rules={[{ required: true, message: 'Tên phải có ít nhất 2 ký tự!' }]}
							label="Quyền riêng tư:"
						>
							<Select
								data-testid="is_internal"
								options={[
									{ value: false as any, label: 'Công khai' },
									{ value: true, label: 'Không công khai' },
								]}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default CategoryModal;
