import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { PricePayload } from '@/types/price';
import { MoneyAmount, Product } from '@medusajs/medusa';
import { message, Modal as AntdModal } from 'antd';
import { CircleAlert } from 'lucide-react';
import { useAdminUpdatePriceList } from 'medusa-react';
import { FC, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import PriceForm from '../pricing-modal/price-form';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	priceListId: string;
	productIds: string[];
};

const EditPricesModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	priceListId,
	productIds,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [productForm, setProductForm] = useState<string[] | null>(null);
	const [productsData, setProductsData] = useState<any>(null);

	useEffect(() => {
		if (productIds) {
			setProductForm(productIds);
		} else {
			setProductForm([]);
		}
	}, [productIds]);
	const { mutateAsync, isLoading: isSubmitting } =
		useAdminUpdatePriceList(priceListId);

	const onCancel = () => {
		setCurrentStep(0);
		setProductForm(null);
		handleCancel();
	};

	const createPayload = ({
		products,
	}: {
		products: any;
		status: 'draft' | 'active';
	}) => {
		let flag: boolean = false;
		const payload: { prices: PricePayload[] } = {
			prices: _.flatten(
				products?.map((product: Product) => {
					const variants = product.variants.map((variant: any) => {
						const pricesPayload: Partial<MoneyAmount>[] = [];
						const priceKeys = Object.keys(variant?.pricesFormatEdit).filter(
							(key) => !key.includes('_id')
						);
						priceKeys.forEach((priceKey) => {
							if (variant.pricesFormatEdit[priceKey]) {
								pricesPayload.push({
									currency_code: priceKey,
									amount: variant.pricesFormatEdit[priceKey],
									variant_id: variant.id,
									id: variant.pricesFormatEdit[`${priceKey}_id`],
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

	const updatePriceList = async (payload: { prices: PricePayload[] }) => {
		await mutateAsync(payload as any, {
			onSuccess: () => {
				message.success('Chỉnh sửa định giá thành công');
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
				await updatePriceList(payload);
				handleOk();
				return;
			},
			onCancel() {
				return false;
			},
		});
	};

	const onSave = async (products: any) => {
		const { payload, flag } = createPayload({ products, status: 'draft' });
		if (flag) {
			notificationConfirm(payload);
			return;
		}
		await updatePriceList(payload);
	};

	const footer = useMemo(() => {
		return [
			<Button
				key="1"
				type="default"
				onClick={() => onCancel()}
				loading={isSubmitting}
				disabled={isSubmitting}
			>
				Hủy
			</Button>,
			<Button
				key="2"
				onClick={() => onSave(productsData)}
				loading={isSubmitting}
				disabled={isSubmitting}
				data-testid="submit-all-price"
			>
				Lưu
			</Button>,
		];
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
				Chỉnh sửa định giá
			</Title>
			<PriceForm
				productForm={productForm}
				productsData={productsData}
				setProductsData={setProductsData}
				priceListId={priceListId}
			/>
		</Modal>
	);
};

export default EditPricesModal;
