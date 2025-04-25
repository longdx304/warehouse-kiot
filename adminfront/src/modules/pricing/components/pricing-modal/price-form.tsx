import { Flex } from '@/components/Flex';
import { Input, InputNumber } from '@/components/Input';
import { Text, Title } from '@/components/Typography';
import { Col, Row, Spin } from 'antd';
import { Search } from 'lucide-react';
import { ChangeEvent, FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { useAdminProducts } from 'medusa-react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Product } from '@medusajs/medusa';
import PricesModal from './edit-price-modal';
import usePrices from '@/modules/products/components/manage-product/hooks/usePrices';

type Props = {
	productForm: string[] | null;
	productsData: any | null;
	setProductsData: (data: any) => void;
	priceListId?: string;
};

const PriceForm: FC<Props> = ({
	productForm,
	productsData,
	setProductsData,
	priceListId,
}) => {
	const [searchValue, setSearchValue] = useState<string>('');
	const { state, onOpen, onClose } = useToggleState(false);
	const [product, setProduct] = useState<any>(null);
	const [discountPercent, setDiscountPercent] = useState<number>(0);
	const { storeRegions } = usePrices(product!);

	const { products, isLoading, isError } = useAdminProducts(
		{
			q: searchValue || undefined,
			id: productForm || undefined,
			expand: 'variants.prices',
			is_giftcard: false,
		},
		{
			enabled: !!productForm?.length,
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (products?.length) {
			products.forEach((product) => {
				const { variants } = product || [];
				if (!variants?.length) {
					return;
				}
				variants.forEach((variant: any) => {
					variant.pricesFormat = variant.prices.reduce(
						(acc: Record<string, number>, price: any) => {
							if (!price?.price_list_id) {
								const taxRegion = storeRegions?.find(
									(region) => region.currency_code === price.currency_code
								);
								const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;
								acc[price.currency_code] = price.amount * (1 + taxRate / 100);
								return acc;
							}
							return acc;
						},
						{}
					);
					// Add prices format edit
					variant.pricesFormatEdit = variant.prices.reduce(
						(acc: Record<string, number | string>, price: any) => {
							if (
								(priceListId && price?.price_list_id === priceListId) ||
								(!priceListId && !price?.price_list_id)
							) {
								const taxRegion = storeRegions?.find(
									(region) => region.currency_code === price.currency_code
								);
								const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;
								const amount = price.amount * (1 + taxRate / 100);
								const discountValue = (amount * discountPercent) / 100 || 0;
								const priceValue = amount ? amount - discountValue : 0;
								acc[price.currency_code] = Math.floor(priceValue);
								priceListId && (acc[`${price.currency_code}_id`] = price.id);
								return acc;
							}
							return acc;
						},
						{}
					);
				});
			});

			setProductsData(products);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [products, discountPercent]);

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleAddPrice = (product: Product) => {
		setProduct(product);
		onOpen();
	};

	const onChangeDiscountPercent = _.debounce((value: number) => {
		setDiscountPercent(value);
	}, 150);

	if (isLoading) {
		return (
			<Flex justify="center" align="center" className="h-[300px]">
				<Spin />
			</Flex>
		);
	}

	if (isError) {
		return (
			<Flex justify="center" align="center" className="h-[300px]">
				<Title level={4} className="text-red-500">
					Có lỗi xảy ra
				</Title>
			</Flex>
		);
	}

	return (
		<Row gutter={[16, 0]}>
			<Col span={24}>
				<Flex justify="space-between" align="center" className="p-4">
					<Title level={4} className="">
						Chỉnh sửa giá
					</Title>
					<Input
						placeholder="Nhập tên sản phẩm"
						className="w-[250px] text-xs"
						size="small"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
					/>
				</Flex>
			</Col>
			<Col span={24}>
				<InputNumber
					prefix="%"
					className="w-full"
					variant="borderless"
					placeholder="Nhập số % giảm giá"
					data-testid="discount-percent"
					onChange={onChangeDiscountPercent as any}
				/>
			</Col>
			<Col span={24} className="">
				<table className="w-full text-left border-gray-200 border-solid border-0 border-t border-b">
					<thead>
						<tr className="[&_th]:text-gray-500 [&_th]:text-sm border-gray-200 [&_th]:px-4 [&_th]:py-2.5 [&_th]:border-0 [&_th]:border-r [&_th]:w-1/3 [&_th:last-of-type]:border-r-0 [&_th]:font-medium">
							<th>Biến thể</th>
							<th>SKU</th>
							<th>Giá</th>
						</tr>
					</thead>
				</table>
			</Col>
			<Col
				span={24}
				className="relative flex h-[400px] flex-1 flex-col overflow-y-auto"
			>
				{productsData?.map((product: Product) => {
					return (
						<div key={product.id}>
							<div className="bg-gray-100 border-solid border-gray-200 border-0 border-b sticky top-0 flex items-center justify-between p-4">
								<div className="flex items-center gap-x-4">
									<div className="bg-gray-100 h-10 w-[30px] overflow-hidden rounded-md">
										{product?.thumbnail && (
											<Image
												src={product.thumbnail}
												alt={product.title || ''}
												width={30}
												height={40}
												className="object-cover h-full w-full"
											/>
										)}
									</div>
									<Flex vertical align="flex-start">
										<Text className="text-[13px]" strong>
											{product.title}
										</Text>
										<Text className="text-xs text-gray-400">{`${
											product?.variants?.length || 0
										} biến thể`}</Text>
									</Flex>
								</div>
								<Button
									type="default"
									onClick={() => handleAddPrice(product as any)}
								>
									Thêm giá
								</Button>
							</div>
							<table className="w-full">
								<tbody>
									{product?.variants?.map((variant: any) => {
										return (
											<tr
												key={variant.id}
												className="border-b-2 border-solid [&_td]:text-gray-500 [&_td]:text-sm border-gray-200 [&_td]:w-1/3 [&_td]:px-4 [&_td]:py-2.5 [&_td]:font-normal"
											>
												<td>{variant.title}</td>
												<td>{variant?.sku ?? '-'}</td>
												<td className="text-right">{`${
													Object.keys(variant?.pricesFormatEdit || {}).filter(
														(key) => !key.includes('_id')
													).length ?? 0
												} giá`}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					);
				})}
			</Col>
			{product && (
				<PricesModal
					state={state}
					handleOk={() => {
						setProduct(null);
						onClose();
					}}
					handleCancel={() => {
						setProduct(null);
						onClose();
					}}
					product={product}
					setProductsData={setProductsData}
					discountPercent={discountPercent}
				/>
			)}
		</Row>
	);
};

export default PriceForm;
