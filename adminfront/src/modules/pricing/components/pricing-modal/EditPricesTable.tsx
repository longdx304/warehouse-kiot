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
	discountPercent: number | null;
	dataSource: any;
	setDataSource: (data: any) => void;
};

const EditPricesTable: FC<Props> = ({
	product,
	currencies,
	regions,
	onPriceUpdate,
	storeRegions,
	isCancel,
	setIsCancel,
	discountPercent,
	setDataSource,
	dataSource
}) => {
	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	};

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
			discountPercent,
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
					discountPercent,
				}),
			};
		});

		return onCellColumn;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product, currencies, regions, dataSource, isCancel, discountPercent]);

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
