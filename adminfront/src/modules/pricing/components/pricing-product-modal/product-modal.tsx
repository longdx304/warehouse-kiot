import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Steps } from '@/components/Steps';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { PricePayload } from '@/types/price';
import { MoneyAmount, Product } from '@medusajs/medusa';
import { message, Modal as AntdModal } from 'antd';
import { CircleAlert } from 'lucide-react';
import { useAdminUpdatePriceList } from 'medusa-react';
import { FC, useMemo, useState } from 'react';
import _ from 'lodash';
import ProductsForm from './product-form';
import PriceForm from '../pricing-modal/price-form';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	productIds: string[];
	priceListId: string;
};

const ITEMS_STEP = [
	{
		title: 'Chọn sản phẩm',
	},
	{
		title: 'Chỉnh sửa Giá',
	},
];

const ProductModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	productIds,
	priceListId,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [productForm, setProductForm] = useState<string[] | null>(null);
	const [productsData, setProductsData] = useState<any>(null);

	const { mutateAsync, isLoading: isSubmitting } =
		useAdminUpdatePriceList(priceListId);

	const onCancel = () => {
		setCurrentStep(0);
		setProductForm(null);
		handleCancel();
	};

	const createPayload = ({ products }: { products: any }) => {
		let flag: boolean = false;
		const payload: { prices: PricePayload[] } = {
			prices: _.flatten(
				products?.map((product: Product) => {
					const variants = product.variants.map((variant: any) => {
						const pricesPayload: Partial<MoneyAmount>[] = [];
						const priceKeys = Object.keys(variant?.pricesFormatEdit);
						priceKeys.forEach((priceKey) => {
							if (variant.pricesFormatEdit[priceKey]) {
								pricesPayload.push({
									currency_code: priceKey,
									amount: variant.pricesFormatEdit[priceKey],
									variant_id: variant.id,
								});
							}
						});
						if (pricesPayload.length > 0) {
							return pricesPayload;
						} else {
							flag = true;
							return;
						}
					});

					if (variants) {
						return _.flatten(variants);
					} else {
						return;
					}
				})
			).filter((item) => item) as PricePayload[],
		};
		return { payload, flag };
	};

	const createPriceList = async (payload: { prices: PricePayload[] }) => {
		await mutateAsync(payload as any, {
			onSuccess: () => {
				message.success('Thêm sản phẩm vào danh sách định giá thành công');
				onCancel();
			},
			onError: (err: any) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const notificationConfirm = (payload: { prices: PricePayload[] }) => {
		AntdModal.confirm({
			title: 'Danh sách giá chưa hoàn chỉnh ?',
			content:
				'Chưa có giá được gán cho tất cả sản phẩm bạn đã chọn. Bạn có muốn tiếp tục không ?',

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
				await createPriceList(payload);
				handleOk();
				return;
			},
			onCancel() {
				return false;
			},
		});
	};

	const onSave = async (products: any) => {
		const { payload, flag } = createPayload({ products });
		if (flag) {
			notificationConfirm(payload);
			return;
		}
		await createPriceList(payload);
	};

	const footer = useMemo(() => {
		if (currentStep === 1) {
			return [
				<Button
					key="1"
					type="default"
					onClick={() => setCurrentStep(0)}
					loading={isSubmitting}
					disabled={isSubmitting}
				>
					Quay lại
				</Button>,
				<Button
					key="2"
					onClick={() => onSave(productsData)}
					loading={isSubmitting}
					disabled={isSubmitting}
					data-testid="submit-add-product"
				>
					Lưu
				</Button>,
			];
		}
		return [];
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep, productsData, setProductsData]);

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			handleCancel={onCancel}
			width={800}
			footer={footer}
		>
			<Title level={3} className="text-center">
				Tạo mới định giá
			</Title>
			<Steps current={currentStep} items={ITEMS_STEP} className="py-4" />
			{currentStep === 0 && (
				<ProductsForm
					setProductForm={setProductForm}
					setCurrentStep={setCurrentStep}
					handleCancel={onCancel}
					productIds={productIds}
				/>
			)}
			{currentStep === 1 && (
				<PriceForm
					productForm={productForm}
					productsData={productsData}
					setProductsData={setProductsData}
				/>
			)}
		</Modal>
	);
};

export default ProductModal;
