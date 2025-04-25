'use client';
import { Modal as AntdModal, message } from 'antd';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Steps } from '@/components/Steps';
import { Title } from '@/components/Typography';
import { FC, useMemo, useState } from 'react';
import DetailForm from './detail-form';
import ProductsForm from './products-form';
import PriceForm from './price-form';
import { DetailFormType, CreatePricingList, PricePayload } from '@/types/price';
import { CircleAlert } from 'lucide-react';
import _ from 'lodash';
import { useAdminCreatePriceList } from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';
import { MoneyAmount, Product } from '@medusajs/medusa';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const ITEMS_STEP = [
	{
		title: 'Tạo danh sách giá',
	},
	{
		title: 'Chọn sản phẩm',
	},
	{
		title: 'Chỉnh sửa Giá',
	},
];

const PricingCreate: FC<Props> = ({ state, handleOk, handleCancel }) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [detailForm, setDetailForm] = useState<DetailFormType | null>(null);
	const [productForm, setProductForm] = useState<string[] | null>(null);
	const [priceForm, setPriceForm] = useState<any>(null);
	const [productsData, setProductsData] = useState<any>(null);

	const { mutateAsync, isLoading: isSubmitting } = useAdminCreatePriceList();

	const onCancel = () => {
		const isValidateStep = onValidateStep();
		if (isValidateStep) {
			setCurrentStep(0);
			setDetailForm(null);
			setProductForm(null);
			setPriceForm(null);
			handleCancel();
		}
	};

	const onValidateStep = () => {
		if (currentStep === 2) {
			return true;
		}
		AntdModal.confirm({
			title: 'Bạn chắc chắn chứ ?',
			content:
				'Có những thay đổi chưa được lưu, bạn có chắc chắn muốn thoát không ?',

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
				handleOk();
			},
			onCancel() {
				return false;
			},
		});
	};

	const createPayload = ({
		products,
		status,
	}: {
		products: any;
		status: 'draft' | 'active';
	}) => {
		let flag: boolean = false;
		const payload: CreatePricingList = {
			name: detailForm?.general?.name || '',
			description: detailForm?.general?.description || '',
			type: detailForm?.type?.value || undefined,
			customer_groups:
				detailForm?.customer_groups?.ids?.map((item) => ({
					id: item,
				})) || undefined,
			status,
			starts_at: detailForm?.dates?.starts_at
				? new Date(detailForm?.dates?.starts_at)
				: undefined,
			ends_at: detailForm?.dates?.ends_at
				? new Date(detailForm?.dates?.ends_at)
				: undefined,
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

	const createPriceList = async (payload: CreatePricingList) => {
		await mutateAsync(payload as any, {
			onSuccess: () => {
				message.success('Tạo định giá cho các sản phẩm thành công');
			},
			onError: (err: any) => {
				message.error(getErrorMessage(err));
			},
		});
	};

	const notificationConfirm = (payload: CreatePricingList) => {
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

	const onSaveDraft = (products: any) => {
		const isValidateStep = onValidateStep();
		if (isValidateStep) {
			const { payload, flag } = createPayload({ products, status: 'draft' });
			if (flag) {
				notificationConfirm(payload);
				return;
			}
			notificationConfirm(payload);
		}
	};

	const onSavePublish = (products: any) => {
		const isValidateStep = onValidateStep();
		if (isValidateStep) {
			const { payload, flag } = createPayload({ products, status: 'active' });
			if (flag) {
				notificationConfirm(payload);
				return;
			}
			notificationConfirm(payload);
		}
	};

	const footer = useMemo(() => {
		if (currentStep === 2) {
			return [
				<Button
					key="1"
					type="default"
					onClick={() => setCurrentStep(1)}
					loading={isSubmitting}
					disabled={isSubmitting}
				>
					Quay lại
				</Button>,
				<Button
					key="2"
					onClick={() => onSaveDraft(productsData)}
					loading={isSubmitting}
					disabled={isSubmitting}
					data-testid="submit-draft"
				>
					Lưu nháp
				</Button>,
				<Button
					key="3"
					onClick={() => onSavePublish(productsData)}
					loading={isSubmitting}
					disabled={isSubmitting}
					data-testid="submit-active"
				>
					Lưu và xuất bản
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
				<DetailForm
					setDetailForm={setDetailForm}
					setCurrentStep={setCurrentStep}
					onCancel={onCancel}
				/>
			)}
			{currentStep === 1 && (
				<ProductsForm
					setProductForm={setProductForm}
					setCurrentStep={setCurrentStep}
				/>
			)}
			{currentStep === 2 && (
				<PriceForm
					productForm={productForm}
					productsData={productsData}
					setProductsData={setProductsData}
				/>
			)}
		</Modal>
	);
};

export default PricingCreate;
