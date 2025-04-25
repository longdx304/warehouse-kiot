import { MoneyAmount, Product } from '@medusajs/medusa';
import { message } from 'antd';
import _ from 'lodash';
import { useAdminUpdateVariant } from 'medusa-react';
import { useRef, useState } from 'react';

import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import usePrices from '@/modules/products/components/manage-product/hooks/usePrices';
import { persistedPrice } from '@/utils/prices';
import EditPricesActions from './EditPricesAction';
import EditPricesTable from './EditPricesTable';

type Props = {
	product?: Product;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const PricesModal = ({ product, state, handleOk, handleCancel }: Props) => {
	const editedPrices = useRef<any>([]);
	const { mutateAsync, isLoading } = useAdminUpdateVariant(product?.id || '');
	const [messageApi, contextHolder] = message.useMessage();

	const {
		selectedCurrencies,
		selectedRegions,
		toggleCurrency,
		toggleRegion,
		storeRegions,
	} = usePrices(product!);

	const [isCancel, setIsCancel] = useState<boolean>(false);

	const onFinish = async () => {
		const newVariant = editedPrices?.current;

		// Update prices for each variant
		const promise = newVariant?.map((variant: any) => {
			const pricesPayload: Partial<MoneyAmount>[] = [];
			// Get all prices keys
			const priceKeys = Object.keys(variant?.pricesFormat);
			// Check if price key is in variant prices
			priceKeys.forEach((priceKey) => {
				// Find price by currency code
				const findPrice =
					variant?.prices?.find(
						(item: any) => item.currency_code === priceKey
					) || {};

				const taxRegion = storeRegions?.find(
					(region) => region.currency_code === priceKey
				);
				const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;

				const amount =
					persistedPrice(priceKey, variant.pricesFormat[priceKey]) /
					(1 + taxRate / 100);
				// Check if price is not empty
				if (!_.isEmpty(findPrice)) {
					// Check if price is different from current price
					if (variant.pricesFormat[priceKey] !== findPrice.amount) {
						pricesPayload.push({
							...findPrice,
							amount,
						});
					}
				} else {
					// If price is empty
					pricesPayload.push({
						currency_code: priceKey,
						amount,
					});
				}
			});
			// Update prices
			// @ts-ignore
			if (pricesPayload?.length) {
				return mutateAsync({
					variant_id: variant.id,
					prices: pricesPayload.map((p) =>
						_.pick(p, ['id', 'amount', 'region_id', 'currency_code'])
					) as any,
				});
			}
		});

		Promise.all(promise)
			.then(() => {
				messageApi.success('Cập nhật giá thành công.');
				handleOk();
			})
			.catch((e: any) => {
				messageApi.success('Có lỗi xảy ra, vui lòng thử lại sau.');
			});
	};

	const onPriceUpdate = (prices: Record<string, number | undefined>[]) => {
		editedPrices.current = prices;
	};

	const onCancel = () => {
		editedPrices.current = {};
		setIsCancel(true);
		handleCancel();
	};

	return (
		<Modal
			open={state}
			handleOk={onFinish}
			isLoading={isLoading}
			handleCancel={onCancel}
			width={800}
		>
			{contextHolder}
			<Title level={3} className="text-center">
				{`Chỉnh sửa giá tiền`}
			</Title>
			<Flex vertical gap="middle">
				<EditPricesActions
					selectedCurrencies={selectedCurrencies.sort()}
					selectedRegions={selectedRegions.sort()}
					toggleCurrency={toggleCurrency}
					toggleRegion={toggleRegion}
				/>
				<EditPricesTable
					product={product!}
					currencies={selectedCurrencies.sort()}
					regions={selectedRegions.sort()}
					onPriceUpdate={onPriceUpdate}
					storeRegions={storeRegions}
					setIsCancel={setIsCancel}
					isCancel={isCancel}
				/>
			</Flex>
		</Modal>
	);
};

export default PricesModal;
