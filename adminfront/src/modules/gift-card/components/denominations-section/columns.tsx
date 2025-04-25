import { Pencil, Trash2 } from 'lucide-react';

import { ActionAbles } from '@/components/Dropdown';
import { MoneyAmount, ProductVariant, Store } from '@medusajs/medusa';
import { MenuProps } from 'antd';
import { normalizeAmount } from '@/utils/prices';
import { Tooltip } from '@/components/Tooltip';

interface Props {
	handleDeleteVariant: (variantId: ProductVariant['id']) => void;
	handleEditVariant: (record: ProductVariant) => void;
	store: Store;
}
const denominationColumns = ({
	handleEditVariant,
	handleDeleteVariant,
	store,
}: Props) => {
	const defaultCurrency = store.default_currency_code;
	return [
		{
			title: 'Mệnh giá',
			dataIndex: 'prices',
			key: 'denomination',
			className: 'text-xs',
			render: (prices: ProductVariant['prices']) => {
				const defaultDenomination = prices.find(
					(price) =>
						price.currency_code === defaultCurrency &&
						price.region_id === null &&
						price.price_list_id === null
				);
				return defaultDenomination ? (
					<p>
						{normalizeAmount(defaultCurrency, defaultDenomination.amount)}{' '}
						<span className="text-gray-500">
							{defaultCurrency.toUpperCase()}
						</span>
					</p>
				) : (
					'-'
				);
			},
		},
		{
			title: 'Trong tiền tệ khác',
			dataIndex: 'prices',
			key: 'other-currencies',
			className: 'text-xs',
			render: (prices: ProductVariant['prices']) => {
				const otherCurrencies = prices.filter(
					(price) =>
						price.currency_code !== defaultCurrency &&
						price.region_id === null &&
						price.price_list_id === null
				);

				let remainder: MoneyAmount[] = [];

				if (otherCurrencies?.length > 2) {
					remainder = otherCurrencies.splice(2);
				}

				// return null;
				return otherCurrencies?.length > 0 ? (
					<p>
						{otherCurrencies.map((p: any, index: number) => {
							return (
								<span key={index}>
									{normalizeAmount(p.currency_code, p.amount)}{' '}
									<span className="text-gray-500">
										{p.currency_code.toUpperCase()}
									</span>
									{index < otherCurrencies.length - 1 && ', '}
								</span>
							);
						})}
						{remainder.length > 0 && (
							<Tooltip
								title={
									<ul>
										{remainder.map((p, index) => {
											return (
												<li key={index}>
													<p>
														{normalizeAmount(p.currency_code, p.amount)}{' '}
														<span className="text-grey-50">
															{p.currency_code.toUpperCase()}
														</span>
													</p>
												</li>
											);
										})}
									</ul>
								}
							>
								<span className="text-grey-50 cursor-default">
									{` và ${remainder.length} tiền tệ khác`}
								</span>
							</Tooltip>
						)}
					</p>
				) : (
					'-'
				);
			},
		},
		{
			title: '',
			key: 'action',
			width: 60,
			fixed: 'right',
			render: (_: any, record: ProductVariant) => {
				const actions = [
					{
						label: <span className="w-full">Chỉnh sửa</span>,
						key: 'edit',
						icon: <Pencil size={20} />,
						// onClick: handleEditVariant(record),
					},
					{
						label: <span className="w-full">Xoá</span>,
						key: 'delete',
						icon: <Trash2 size={20} />,
						danger: true,
					},
				];

				const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
					if (key === 'edit') {
						handleEditVariant(record);
						return;
					}
					// Case item is delete
					if (key === 'delete') {
						handleDeleteVariant(record.id);
						return;
					}
				};

				return <ActionAbles actions={actions} onMenuClick={handleMenuClick} />;
			},
		},
	];
};

export default denominationColumns;
