import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/utils';
import { PricePayload } from '@/types/price';
import { MoneyAmount, Product } from '@medusajs/medusa';
import { Modal as AntdModal, message } from 'antd';
import _ from 'lodash';
import { CircleAlert } from 'lucide-react';
import { useAdminRegions, useAdminUpdatePriceList } from 'medusa-react';
import { FC, useEffect, useMemo, useState } from 'react';
import PriceForm from '../pricing-modal/price-form';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	productId: string;
	priceListId: string;
};

const EditPriceModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	productId,
	priceListId,
}) => {
	const [productForm, setProductForm] = useState<string[] | null>(null);
	const [productsData, setProductsData] = useState<any>(null);

	const { regions: storeRegions } = useAdminRegions({
		limit: 1000,
	});
	const { mutateAsync, isLoading: isSubmitting } =
		useAdminUpdatePriceList(priceListId);

	const onCancel = () => {
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
						const priceKeys = Object.keys(variant?.pricesFormatEdit).filter(
							(key) => !key.includes('_id')
						);
						priceKeys.forEach((priceKey) => {
							if (variant.pricesFormatEdit[priceKey]) {
								const taxRegion = storeRegions?.find(
									(region) => region.currency_code === priceKey
								);
								const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;
								pricesPayload.push({
									currency_code: priceKey,
									amount:
										variant.pricesFormatEdit[priceKey] / (1 + taxRate / 100),
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
				await updatePriceList(payload);
				handleOk();
				return;
			},
			onCancel() {
				return false;
			},
		});
	};

	useEffect(() => {
		setProductForm([productId]);
	}, [productId]);

	const onSave = async (products: any) => {
		const { payload, flag } = createPayload({ products });
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
			>
				Lưu
			</Button>,
		];
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productsData, setProductsData]);

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			handleCancel={onCancel}
			width={800}
			footer={footer}
		>
			{/* <Title level={3} className="text-center"> */}
			{/* 	Tạo mới định giá */}
			{/* </Title> */}
			<PriceForm
				productForm={productForm}
				productsData={productsData}
				setProductsData={setProductsData}
				priceListId={priceListId}
			/>
		</Modal>
	);
};

export default EditPriceModal;
