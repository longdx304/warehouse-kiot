import { Product } from '@medusajs/medusa';
import { Form, FormProps, message } from 'antd';
import { useAdminDeleteFile, useAdminUpdateProduct } from 'medusa-react';
import { FC, useEffect } from 'react';

import { splitFiles } from '@/actions/images';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { getErrorMessage } from '@/lib/utils';
import ThumbnailForm from '@/modules/products/components/products-modal/components/ThumbnailForm';
import { ThumbnailFormType } from '@/types/products';

type Props = {
	product: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

type ThumbnailFormProps = {
	thumbnail: ThumbnailFormType;
};

const ThumbnailModal: FC<Props> = ({
	product,
	state,
	handleOk,
	handleCancel,
}) => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();
	const updateProduct = useAdminUpdateProduct(product?.id);
	const uploadFile = useAdminUploadFile();
	const deleteFile = useAdminDeleteFile();

	useEffect(() => {
		form.setFieldsValue({
			thumbnail: product?.thumbnail
				? [
						{
							url: product?.thumbnail,
							name: 'Hình ảnh',
						},
				  ]
				: [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, state]);

	const onFinish: FormProps<ThumbnailFormProps>['onFinish'] = async (
		values
	) => {
		// Check if thumbnail is the same
		if (values?.thumbnail[0]?.url === product?.thumbnail) {
			handleOk();
			return;
		}
		// Prepped images thumbnail
		if (values.thumbnail?.length) {
			try {
				const oldImg = product?.thumbnail ? [product.thumbnail] : null;
				const { uploadImages, existingImages, deleteImages } = splitFiles(
					values?.thumbnail,
					oldImg
				);
				let newImages: any = [...existingImages];
				if (uploadImages?.length) {
					const { uploads } = await uploadFile.mutateAsync({
						files: uploadImages,
						prefix: 'product',
					});
					newImages = [...newImages, ...uploads];
				}
				if (deleteImages?.length) {
					await deleteFile.mutateAsync({ file_key: deleteImages });
				}
				await updateImageProduct(newImages[0].url);
			} catch (error) {
				console.log('error:', error);
				messageApi.error('Đã xảy ra lỗi khi tải hình ảnh lên.');
				return;
			}
		}
	};

	const updateImageProduct = async (url: string) => {
		await updateProduct.mutateAsync(
			{ thumbnail: url },
			{
				onSuccess: async () => {
					messageApi.success('Chỉnh sửa ảnh đại diện thành công');
					handleOk();
					return;
				},
				onError: (error) => {
					messageApi.error(getErrorMessage(error));
				},
			}
		);
	};

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			isLoading={updateProduct?.isLoading}
			handleCancel={handleCancel}
			form={form}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{`Chỉnh sửa thumbnail`}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-3">
				<ThumbnailForm form={form} />
			</Form>
		</SubmitModal>
	);
};

export default ThumbnailModal;
