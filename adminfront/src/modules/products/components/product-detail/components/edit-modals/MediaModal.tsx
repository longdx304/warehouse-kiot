import { splitFiles } from '@/actions/images';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { getErrorMessage } from '@/lib/utils';
import MediaForm from '@/modules/products/components/products-modal/components/MediaForm';
import { FormImage } from '@/types/common';
import { MediaFormType } from '@/types/products';
import { AdminUploadsRes, Product } from '@medusajs/medusa';
import { Form, FormProps, message } from 'antd';
import _ from 'lodash';
import { useAdminDeleteFile, useAdminUpdateProduct } from 'medusa-react';
import { FC, useEffect } from 'react';

type Props = {
	product: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

type MediaFormProps = {
	media: MediaFormType;
};

const MediaModal: FC<Props> = ({ product, state, handleOk, handleCancel }) => {
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();
	const updateProduct = useAdminUpdateProduct(product?.id);
	const uploadFile = useAdminUploadFile();
	const deleteFile = useAdminDeleteFile();

	useEffect(() => {
		form.setFieldsValue({
			media: product?.images?.length
				? product?.images?.map((image, index) => ({
						id: image.id,
						url: image.url,
						name: `Hình ảnh ${index + 1}`,
						selected: false,
				  }))
				: [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, state]);

	const checkUrlMatch = (
		images: FormImage[],
		productImages: Product['images']
	) => {
		const urls = productImages?.map((image) => image.url) || [];
		const newUrls = images?.map((image) => image.url) || [];
		return _.isEqual(urls, newUrls);
	};

	const onFinish: FormProps<MediaFormProps>['onFinish'] = async (values) => {
		if (checkUrlMatch(values?.media, product?.images)) {
			handleOk();
			return;
		}
		if (values?.media?.length) {
			try {
				const { uploadImages, existingImages, deleteImages } = splitFiles(
					values?.media,
					product?.images?.map((image) => image.url)
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
				await updateMediaProduct(newImages.map((image: any) => image.url));
			} catch (error) {
				messageApi.error('Đã xảy ra lỗi khi tải hình ảnh lên.');
				return;
			}

			return;
		}
	};

	const updateMediaProduct = async (urls: string[]) => {
		await updateProduct.mutateAsync(
			{ images: urls },
			{
				onSuccess: async () => {
					messageApi.success('Chỉnh sửa media thành công');
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
			// width={800}
			form={form}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{`Chỉnh sửa media`}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-3">
				<MediaForm form={form} />
			</Form>
		</SubmitModal>
	);
};

export default MediaModal;
