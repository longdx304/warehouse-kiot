import { Product, Region } from '@medusajs/medusa';
import { FC, useEffect, useMemo, useState } from 'react';

import { Table } from '@/components/Table';
import PricesColumn from './prices-column';
import { EditableCell, EditableRow } from './prices-components';

type Props = {
	product: Product;
	currencies: string[];
	regions: string[];
	onPriceUpdate: (prices: Record<string, number | undefined>[]) => void;
	storeRegions: Region[] | undefined;
	setIsCancel: (action: boolean) => void;
	isCancel: boolean;
};

const EditPricesTable: FC<Props> = ({
	product,
	currencies,
	regions,
	onPriceUpdate,
	storeRegions,
	isCancel,
	setIsCancel,
}) => {
	const [dataSource, setDataSource] = useState<any>(null);

	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	};

	useEffect(() => {
		formatProduct();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, isCancel]);

	const handleSave = (row: any) => {
		setIsCancel(false);
		const newVariants = [...(dataSource as any)];
		const indexVariant = newVariants.findIndex(
			(variant) => row.id === variant.id
		);
		const itemVariant = newVariants[indexVariant];
		newVariants.splice(indexVariant, 1, {
			...itemVariant,
			...row,
		});

		setDataSource(newVariants as any);
		onPriceUpdate(newVariants);
	};

	const columns = useMemo(() => {
		const pricesColumn = PricesColumn({
			currencies,
			prices: product?.variants ?? [],
			storeRegions,
		});
		const onCellColumn = pricesColumn.map((column: any) => {
			if (!column?.editable) {
				return column;
			}
			return {
				...column,
				onCell: (record: any) => ({
					record,
					editable: column.editable,
					dataIndex: column.dataIndex,
					title: column.title,
					handleSave: handleSave,
					storeRegions,
				}),
			};
		});

		return onCellColumn;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, currencies, regions, dataSource, isCancel]);

	const formatProduct = () => {
		const { variants } = product || [];
		if (!variants?.length) {
			setDataSource([]);
			return;
		}
		variants.forEach((variant: any) => {
			variant.pricesFormat = variant.prices.reduce(
				(acc: Record<string, number>, price: any) => {
					const taxRegion = storeRegions?.find(
						(region) => region.currency_code === price.currency_code
					);
					const taxRate: number = taxRegion ? taxRegion.tax_rate : 0;
					acc[price.currency_code] = Math.round(
						price.amount * (1 + taxRate / 100)
					);
					return acc;
				},
				{}
			);
		});
		setDataSource(variants as any);
		return;
	};

	return (
		<Table
			components={components}
			rowClassName={() => 'editable-row'}
			columns={columns || []}
			dataSource={dataSource ?? []}
			rowKey="id"
			bordered
			pagination={false}
		/>
	);
};

export default EditPricesTable;
