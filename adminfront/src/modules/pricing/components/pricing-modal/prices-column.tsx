import { Flex } from '@/components/Flex';
import { Text } from '@/components/Typography';
import { currencies as CURRENCY_MAP } from '@/types/currencies';

type Props = {
	currencies: string[];
	storeRegions: any;
	prices: any;
	discountPercent: number | null;
};

/**
 * Return currency metadata or metadata of region's currency
 */
function useCurrencyMeta(
	storeRegions: any,
	currencyCode: string | undefined,
	regionId: string | undefined
) {
	if (currencyCode) {
		return CURRENCY_MAP[currencyCode?.toUpperCase()];
	}

	// if (storeRegions) {
	// 	const region = regions.find((r) => r.id === regionId);
	// 	return CURRENCY_MAP[storeRegions!.currency_code.toUpperCase()];
	// }
}

const PricesColumn = ({ currencies, storeRegions, discountPercent }: Props) => {
	const columnsCurrencies = currencies.map((currency, index) => {
		return {
			title: `Giá ${currency.toUpperCase()}`,
			dataIndex: ['pricesFormatEdit', currency],
			key: currency,
			editable: true,
			width: 200,
			render: (price: any, record: any) => {
				// eslint-disable-next-line react-hooks/rules-of-hooks
				const currencyMeta = useCurrencyMeta(storeRegions, currency, '');
				return (
					<Flex align="center" justify="space-between">
						<Text className="text-gray-500 font-medium">
							{currencyMeta?.symbol_native}
						</Text>
						<Text className="">
							{`${price ?? '-'}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						</Text>
					</Flex>
				);
			},
		};
	});
	const columnsCurrenciesOrigin = currencies.map((currency, index) => {
		return {
			title: `Giá ${currency.toUpperCase()} gốc`,
			dataIndex: ['pricesFormat', currency],
			key: currency,
			width: 200,
			render: (price: any, record: any) => {
				// eslint-disable-next-line react-hooks/rules-of-hooks
				const currencyMeta = useCurrencyMeta(storeRegions, currency, '');
				return (
					<Flex align="center" justify="space-between">
						<Text className="text-gray-500 font-medium">
							{currencyMeta?.symbol_native}
						</Text>
						<Text className="line-through">
							{`${price ?? '-'}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						</Text>
					</Flex>
				);
			},
		};
	});

	return [
		{
			title: 'Sản phẩm',
			dataIndex: 'title',
			key: 'title',
			width: 200,
			render: (_: string, record: any) => (
				<Text className="text-gray-600">{`${_} ∙ ${record?.sku || ''}`}</Text>
			),
		},
		...columnsCurrenciesOrigin,
		...columnsCurrencies,
	];
};

export default PricesColumn;
