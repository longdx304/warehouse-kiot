import { Flex } from '@/components/Flex';
import { SubmitModal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { Product } from '@medusajs/medusa';
import { Form, FormProps, message } from 'antd';
import { useMedusa } from 'medusa-react';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

type Props = {
	product: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

type VariantFormProps = {
	images: Record<string, string>;
};

const VariantImgsModal: FC<Props> = ({
	product,
	state,
	handleOk,
	handleCancel,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [form] = Form.useForm();
	const formData = Form.useWatch('images', form) || {};
	const { client } = useMedusa();

	useEffect(() => {
		const variantImages =
			product?.metadata?.variant_images &&
			JSON.parse(product?.metadata?.variant_images as string);
		if (variantImages) {
			form.setFieldsValue({
				images: variantImages.reduce(
					(acc: Record<string, string>, curr: any) => {
						acc[curr.image_url] = curr.variant_value;
						return acc;
					},
					{}
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product]);

	const createPayload = (values: Record<string, unknown>) => {
		const images = Object.entries(values)
			.map(([key, value]) => ({
				image_url: key,
				variant_value: value,
			}))
			.filter((image) => image.variant_value);

		return {
			images,
		};
	};

	const onFinish: FormProps<VariantFormProps>['onFinish'] = async (values) => {
		const payload = createPayload(values.images);

		setIsLoading(true);
		await client.admin.products
			.setMetadata(product.id, {
				key: 'variant_images',
				value: JSON.stringify(payload.images),
			})
			.then(() => {
				setIsLoading(false);
				handleOk();
				message.success('Cập nhật hình ảnh cho biến thể thành công');
			})
			.catch((err) => {
				setIsLoading(false);
				message.error(getErrorMessage(err));
			});
	};

	const valuesDisabled = Object.values(formData).filter((value) => value);
	const optionsSelect = product?.options?.map((option) => {
		const uniqueValues = Array.from(
			new Set(option.values.map((value: any) => value.value))
		);
		return {
			title: option.title,
			label: option.title,
			options: uniqueValues.map((value) => ({
				value: value,
				label: value,
				disabled: valuesDisabled.includes(value),
			})),
		};
	});

	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={isLoading}
			form={form}
		>
			<Title level={3} className="text-center">
				Hình ảnh cho các biến thể
			</Title>
			<Form
				form={form}
				onFinish={onFinish}
				className="flex flex-col gap-y-4 w-full mt-4"
			>
				{product?.images?.map((img) => (
					<Flex
						key={img.id}
						className="w-full"
						align="center"
						justify="space-between"
					>
						<Image
							className="rounded-md"
							src={img.url}
							alt={img.id}
							width={64}
							height={64}
						/>
						<Form.Item name={['images', img.url]}>
							<Select
								placeholder="Chọn biến thể"
								className="w-[150px]"
								options={optionsSelect}
								allowClear
							/>
						</Form.Item>
					</Flex>
				))}
			</Form>
		</SubmitModal>
	);
};

export default VariantImgsModal;
