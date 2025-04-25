import { Check, Settings2 } from 'lucide-react';
import { useAdminRegions, useAdminStore } from 'medusa-react';
import { FC, useMemo } from 'react';

import { Dropdown } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Text } from '@/components/Typography';

type Props = {
	selectedCurrencies: string[];
	selectedRegions: string[];
	toggleCurrency: (currencyCode: string) => void;
	toggleRegion: (regionId: string) => void;
};

const EditPricesActions: FC<Props> = ({
	selectedCurrencies,
	selectedRegions,
	toggleCurrency,
	toggleRegion,
}) => {
	const { store } = useAdminStore();
	const _currencies = store?.currencies;
	const { regions: _regions } = useAdminRegions({
		limit: 1000,
	});

	const currencies = useMemo(() => {
		return (_currencies || []).sort((c1, c2) => c1.code.localeCompare(c2.code));
	}, [_currencies]);

	const regions = useMemo(() => {
		return (_regions || []).sort((r1, r2) => r1.name.localeCompare(r2.name));
	}, [_regions]);

	// Handle user click dropdown
	const handleDropdownClick = ({ key }: { key: string }) => {};

	const renderCurrencyLabel = (currency: any) => {
		return (
			<Flex gap="middle" align="center" justify="space-between">
				<Text>{currency.code.toUpperCase()}</Text>
				<Flex gap="small">
					<Text className="text-gray-400 text-xs">{currency.name}</Text>
					{selectedCurrencies.includes(currency.code) && <Check size={18} />}
				</Flex>
			</Flex>
		);
	};
	const renderRegionLabel = (region: any) => {
		return (
			<Flex gap="middle" align="center" justify="space-between">
				<Text>{region.name}</Text>
				{selectedRegions.includes(region.id) && <Check size={18} />}
			</Flex>
		);
	};

	const itemDropDown = useMemo(() => {
		return [
			{
				key: 'currencies',
				label: 'Tiền tệ',
				type: 'group',
				children: currencies?.map((currency) => ({
					key: currency.code,
					label: renderCurrencyLabel(currency),
					type: 'item',
					onClick: () => toggleCurrency(currency.code),
				})),
			},
			{
				key: 'regions',
				label: 'Khu vực',
				type: 'group',
				children: regions?.map((region: any) => ({
					key: region.code,
					label: renderRegionLabel(region),
					type: 'item',
					onClick: () => toggleRegion(region.id),
				})),
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCurrencies, selectedRegions]);

	return (
		<div>
			<Dropdown menu={{ items: itemDropDown as any, onClick: () => {} }}>
				<a onClick={(e) => e.preventDefault()} className="w-fit block">
					<Flex
						gap="small"
						align="center"
						className="w-fit py-2 px-3 border border-gray-300 border-solid rounded-lg"
					>
						<Settings2 size={18} />
						<Text className="font-medium">{'Tiền tệ'}</Text>
					</Flex>
				</a>
			</Dropdown>
		</div>
	);
};

export default EditPricesActions;
