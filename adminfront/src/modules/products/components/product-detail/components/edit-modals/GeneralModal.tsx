import {
	AdminPostProductsProductReq,
	Product,
	ProductCollection,
} from '@medusajs/medusa';
import { Form, FormProps, message } from 'antd';
import { useAdminUpdateProduct } from 'medusa-react';
import { FC, useEffect } from 'react';

import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import GeneralForm from '@/modules/products/components/products-modal/components/GeneralForm';
import OrganizeForm from '@/modules/products/components/products-modal/components/OrganizeForm';
import { GeneralFormType, OrganizeFormType } from '@/types/products';

type Props = {
	product: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	treeData: any;
	collections: ProductCollection[];
};

type GeneralFormProps = {
	general: GeneralFormType;
	organize: OrganizeFormType;
};

const GeneralModal: FC<Props> = ({
	product,
	state,
	handleOk,
	handleCancel,
	treeData,
	collections,
}) => {
	const [form] = Form.useForm();
	const updateProduct = useAdminUpdateProduct(product?.id);
	const [messageApi, contextHolder] = message.useMessage();

	useEffect(() => {
		form.setFieldsValue({
			general: {
				title: product?.title || '',
				handle: product?.handle || '',
				material: product?.material || '',
				description: product?.description || '',
				discountable: product?.discountable || true,
			},
			organize: {
				type: product?.type || '',
				collection: product?.collection_id || '',
				categories: product?.categories?.map((category) => category.id) || [],
				tags: product?.tags?.map((tag) => tag.value) || [],
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product]);

	const onFinish: FormProps<GeneralFormProps>['onFinish'] = async (values) => {
		const payload: AdminPostProductsProductReq = {
			title: values?.general?.title,
			subtitle: values?.general?.subtitle || undefined,
			material: values?.general?.material || undefined,
			handle: values?.general?.handle || undefined,
			description: values?.general?.description || undefined,
			discountable: values?.general?.discounted,
			collection_id: (values?.organize?.collection as any) || undefined,
			tags: values?.organize?.tags?.length
				? values?.organize?.tags?.map((tag) => ({ value: tag }))
				: undefined,
			categories: values?.organize?.categories?.length
				? values.organize.categories.map((category) => ({ id: category }))
				: undefined,
			type: values?.organize?.type
				? {
						value: values.organize.type.label,
						id: values.organize.type.value,
				  }
				: undefined,
		};

		updateProduct.mutate(payload, {
			onSuccess: () => {
				messageApi.success('Chỉnh sửa thông tin thành công');
				handleOk();
			},
			onError: (error) => {
				messageApi.error(getErrorMessage(error));
			},
		});
	};

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			isLoading={updateProduct.isLoading}
			handleCancel={handleCancel}
			// width={800}
			form={form}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{`Chỉnh sửa media`}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-3">
				<GeneralForm />
				<OrganizeForm
					treeCategories={treeData}
					isEdit={true}
					productCollections={collections}
				/>
			</Form>
		</SubmitModal>
	);
};

export default GeneralModal;
