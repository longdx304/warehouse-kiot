import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input, InputNumber } from '@/components/Input';
import { Switch } from '@/components/Switch';
import { Text } from '@/components/Typography';
import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { getErrorMessage } from '@/lib/utils';
import { currencies } from '@/types/currencies';
import { normalizeAmount, persistedPrice } from '@/utils/prices';
import { MoneyAmount, Product } from '@medusajs/medusa';
import { Form, message, Row } from 'antd';
import { update } from 'lodash';
import { Coins } from 'lucide-react';
import {
	ProductVariant,
	useAdminCreateVariant,
	useAdminStore,
	useAdminUpdateVariant,
} from 'medusa-react';
import { useContext, useEffect, useMemo, useState } from 'react';

type Props = {
	open: boolean;
	onClose: () => void;
	denomination?: ProductVariant | null;
	giftCard: Product;
};

type DenominationType = {
	amount: number;
	currency_code: string;
	includes_tax?: boolean;
};

export type DenominationFormType = {
	defaultDenomination: DenominationType;
	currencyDenominations: DenominationType[];
	metadata?: any;
};

const ModalDenomination = ({
	denomination,
	onClose,
	open,
	giftCard,
}: Props) => {
	const { store } = useAdminStore();
	const { mutate, isLoading: isCreating } = useAdminCreateVariant(giftCard.id);
	const { mutate: mutateUpdate, isLoading: isUpdating } = useAdminUpdateVariant(
		giftCard.id
	);

	const layeredModalContext = useContext(LayeredModalContext);

	const [form] = Form.useForm();
	const [hiddenOtherCurrencies, setShowOtherCurrencies] =
		useState<boolean>(false);

	const isEdit = !!denomination;

	const defaultValues: DenominationFormType | undefined = useMemo(() => {
		if (!store) {
			return undefined;
		}

		// if create new denomination
		if (!isEdit) {
			return {
				defaultDenomination: {
					currency_code: store.default_currency_code.toUpperCase(),
					includes_tax: store.currencies.find(
						(c) => c.code === store.default_currency_code
					)?.includes_tax,
				},
				currencyDenominations: store.currencies
					.filter((c) => c.code !== store.default_currency_code)
					.map((currency) => {
						return {
							currency_code: currency.code.toUpperCase(),
							includes_tax: currency.includes_tax,
						};
					}),
			} as DenominationFormType;
		}
		// if edit denomination
		if (denomination) {
			return {
				defaultDenomination: {
					currency_code: store.default_currency_code.toUpperCase(),
					includes_tax: store.currencies.find(
						(c) => c.code === store.default_currency_code
					)?.includes_tax,
					amount: findPrice(store.default_currency_code, denomination.prices),
				},
				currencyDenominations: store.currencies
					.filter((c) => c.code !== store.default_currency_code)
					.map((currency) => {
						return {
							currency_code: currency.code.toUpperCase(),
							includes_tax: currency.includes_tax,
							amount: findPrice(currency.code, denomination.prices),
						};
					}),
			} as DenominationFormType;
		}
	}, [store, denomination, isEdit]);

	useEffect(() => {
		if (defaultValues) {
			form.setFieldsValue(defaultValues);
			if (
				defaultValues.currencyDenominations.every(
					(c) => c.amount === defaultValues.defaultDenomination.amount
				)
			) {
				setShowOtherCurrencies(true);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValues]);

	const footer = useMemo(
		() => (
			<div className="flex items-center justify-end gap-2">
				<Button
					onClick={onClose}
					loading={isCreating || isUpdating}
					type="text"
					className="text-sm w-32 font-semibold justify-center"
				>
					Hủy
				</Button>
				<Button
					className="text-sm min-w-32 justify-center"
					loading={isCreating || isUpdating}
					onClick={() => {
						form.submit();
					}}
				>
					{'Lưu và đóng'}
				</Button>
			</div>
		),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isCreating, isUpdating]
	);

	const onFinish = async (data: DenominationFormType) => {
		// Create new denomination
		if (!isEdit) {
			const payload = createPayload(
				giftCard,
				data,
				hiddenOtherCurrencies,
				defaultValues
			);
			mutate(payload, {
				onSuccess: () => {
					message.success('Tạo mệnh giá thành công');
					onClose();
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			});
		} else {
			// update denomination
			const payload = updatePayload(data, hiddenOtherCurrencies, defaultValues);
			mutateUpdate(
				{ variant_id: denomination.id, ...payload },
				{
					onSuccess: () => {
						message.success('Cập nhật mệnh giá thành công');
						onClose();
					},
					onError: (error) => {
						message.error(getErrorMessage(error));
					},
				}
			);
		}
	};

	return (
		<LayeredModal
			// loading={isLoading}
			context={layeredModalContext}
			onCancel={onClose}
			open={open}
			footer={footer}
			title="Tạo mệnh giá"
			className="layered-modal"
			width={800}
		>
			<Form form={form} onFinish={onFinish}>
				<div className="flex flex-col gap-4">
					<Text strong>Tiền tệ mặc định</Text>
					<div className="flex justify-between items-center">
						<Form.Item
							labelCol={{ span: 24 }}
							name={['defaultDenomination', 'currency_code']}
							className="mb-2"
						>
							<Input prefix={<Coins />} disabled className="w-[150px]" />
						</Form.Item>
						<Form.Item
							labelCol={{ span: 24 }}
							name={['defaultDenomination', 'amount']}
							className="mb-2"
							rules={[{ required: true, message: 'Vui lòng nhập mệnh giá' }]}
						>
							<InputNumber
								min={0}
								placeholder="-"
								prefix={
									currencies[
										defaultValues?.defaultDenomination?.currency_code.toUpperCase() ??
											'VND'
									].symbol
								}
							/>
						</Form.Item>
					</div>
					<Flex justify="space-between" align="flex-start">
						<Flex vertical>
							<Text strong className="text-sm">
								Sử dụng giá trị cho tất cả các loại tiền tệ?
							</Text>
							<Text className="text-[13px] text-gray-600">
								Nếu được bật, giá trị được sử dụng cho mã tiền tệ mặc định của
								cửa hàng cũng sẽ được áp dụng cho tất cả các loại tiền tệ khác
								trong cửa hàng của bạn.
							</Text>
						</Flex>
						<Switch
							value={hiddenOtherCurrencies}
							onChange={(checked: boolean) => setShowOtherCurrencies(checked)}
							className=""
						/>
					</Flex>
					{!hiddenOtherCurrencies &&
						defaultValues?.currencyDenominations.map((currency, index) => (
							<div
								className="flex justify-between items-center"
								key={currency.currency_code}
							>
								<Form.Item
									labelCol={{ span: 24 }}
									name={['currencyDenominations', index, 'currency_code']}
									className="mb-2"
								>
									<Input prefix={<Coins />} disabled className="w-[150px]" />
								</Form.Item>
								<Form.Item
									labelCol={{ span: 24 }}
									name={['currencyDenominations', index, 'amount']}
									className="mb-2"
								>
									<InputNumber
										min={0}
										placeholder="-"
										prefix={
											currencies[currency.currency_code.toUpperCase() ?? 'VND']
												.symbol
										}
									/>
								</Form.Item>
							</div>
						))}
				</div>
			</Form>
		</LayeredModal>
	);
};

export default ModalDenomination;

const createPayload = (
	giftCard: Product,
	data: DenominationFormType,
	useSameValue: boolean,
	defaultValues: DenominationFormType | undefined
) => {
	const payload = {
		title: `${giftCard.variants.length}`,
		options: [
			{
				value: `${data.defaultDenomination.amount}`,
				option_id: giftCard.options[0].id,
			},
		],
		prices: [
			{
				amount: persistedPrice(
					data.defaultDenomination.currency_code,
					data.defaultDenomination.amount
				),
				currency_code: data.defaultDenomination.currency_code,
			},
		],
		inventory_quantity: 0,
		manage_inventory: false,
	};

	defaultValues?.currencyDenominations.forEach((currency) => {
		if (
			(currency.amount !== null && currency.amount !== undefined) ||
			useSameValue
		) {
			payload.prices.push({
				amount: useSameValue
					? persistedPrice(
							currency.currency_code,
							data.defaultDenomination.amount
					  )
					: persistedPrice(currency.currency_code, currency.amount),
				currency_code: currency.currency_code,
			});
		}
	});

	return payload;
};

const updatePayload = (
	data: DenominationFormType,
	useSameValue: boolean,
	defaultValues: DenominationFormType | undefined
) => {
	const payload = {
		prices: [
			{
				amount: persistedPrice(
					data.defaultDenomination.currency_code,
					data.defaultDenomination.amount
				),
				currency_code: data.defaultDenomination.currency_code,
			},
		],
	};

	defaultValues?.currencyDenominations.forEach((currency) => {
		if (
			(currency.amount !== null && currency.amount !== undefined) ||
			useSameValue
		) {
			payload.prices.push({
				amount: useSameValue
					? persistedPrice(
							currency.currency_code,
							data.defaultDenomination.amount
					  )
					: persistedPrice(currency.currency_code, currency.amount),
				currency_code: currency.currency_code,
			});
		}
	});

	return payload;
};

const findPrice = (currencyCode: string, prices: MoneyAmount[]) => {
	const amount =
		prices.find(
			(p) =>
				p.currency_code === currencyCode &&
				p.region_id === null &&
				p.price_list_id === null
		)?.amount ?? 0;
	return normalizeAmount(currencyCode, amount);
};
