import { LineItem, Order } from '@medusajs/medusa';
import React, { useState, useEffect } from 'react';
import { Table } from '@/components/Table';
import productsColumns from './products-column';
import { EditableRow, EditableCell } from './products-component';
import { isLineItemCanceled } from '@/utils/is-line-item';

type RMASelectProductTableProps = {
	order: Omit<Order, 'beforeInsert'>;
	allItems: Omit<LineItem, 'beforeInsert'>[];
	toReturn: any;
	setToReturn: (items: any) => void;
	customReturnOptions?: any[];
	imagesOnReturns?: any;
	isSwapOrClaim?: boolean;
};

const RMASelectProductTable: React.FC<RMASelectProductTableProps> = ({
	order,
	allItems,
	toReturn,
	customReturnOptions = undefined,
	imagesOnReturns = false,
	setToReturn,
	isSwapOrClaim = false,
}) => {
	const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
	const [dataSource, setDataSource] = useState<
		Omit<LineItem, 'beforeInsert'>[]
	>([]);

	useEffect(() => {
		setDataSource(
			allItems
				.map((item) => {
					if (
						item.returned_quantity === item.quantity ||
						isLineItemCanceled(item, order)
					) {
						return;
					}
					return {
						...item,
						return_quantity: item.quantity - (item.returned_quantity || 0),
					};
				})
				.filter((item) => item) as any
		);
	}, [allItems, order]);

	const handleReturnToggle = (
		record: Omit<LineItem, 'beforeInsert'>,
		selected: boolean
	) => {
		const newReturns = { ...toReturn };
		if (selected) {
			newReturns[record.id] = {
				images: null,
				reason: null,
				note: '',
				quantity: record.quantity - (record.returned_quantity ?? 0),
			};
		} else {
			delete newReturns[record.id];
			const newVariants = [...(dataSource as any)];
			const indexVariant = newVariants.findIndex(
				(variant) => record.id === variant.id
			);
			newVariants.splice(indexVariant, 1, {
				...record,
				reason: null,
				note: '',
				return_quantity: record.quantity - (record.returned_quantity ?? 0),
			});
			setDataSource(newVariants as any);
		}

		setToReturn(newReturns);
	};

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedVariants(selectedRowKeys as string[]);
	};

	const handleQuantity = (change: number, item: any) => {
		if (
			(item.quantity - (item.returned_quantity || 0) ===
				toReturn[item.id]?.quantity &&
				change > 0) ||
			(toReturn[item.id]?.quantity === 1 && change < 0)
		) {
			return;
		}

		const newReturns = {
			...toReturn,
			[item.id]: {
				...toReturn[item.id],
				quantity: (toReturn[item.id]?.quantity || 0) + change,
			},
		};
		const newVariants = [...(dataSource as any)];
		const indexVariant = newVariants.findIndex(
			(variant) => item.id === variant.id
		);
		newVariants.splice(indexVariant, 1, {
			...item,
			return_quantity: item.return_quantity + change,
		});
		setDataSource(newVariants as any);

		setToReturn(newReturns);
	};

	const handleReason = (reason: any, itemId: string) => {
		const newReturns = {
			...toReturn,
			[itemId]: {
				...toReturn[itemId],
				reason: reason?.reason?.value || null,
				note: reason?.note || '',
			},
		};
		const newVariants = [...(dataSource as any)];
		const indexVariant = newVariants.findIndex(
			(variant) => itemId === variant.id
		);
		newVariants.splice(indexVariant, 1, {
			...newVariants[indexVariant],
			reason: reason?.reason || null,
			note: reason?.note || '',
		});

		setDataSource(newVariants as any);
		setToReturn(newReturns);
	};

	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	};

	const columns = productsColumns({ currencyCode: order.currency_code }).map(
		(col) => {
			if (!col?.editable) {
				return col;
			}
			return {
				...col,
				onCell: (record: any) => ({
					record,
					editable: selectedVariants.includes(record.id),
					dataIndex: col.dataIndex,
					title: col.title,
					handleQuantity,
					handleReason,
				}),
			};
		}
	);

	return (
		<Table
			components={components}
			rowClassName={() => 'editable-row'}
			rowSelection={{
				type: 'checkbox',
				selectedRowKeys: selectedVariants,
				onChange: handleRowSelectionChange,
				preserveSelectedRowKeys: true,
				onSelect: handleReturnToggle as any,
			}}
			// loading={isLoading}
			columns={columns as any}
			dataSource={dataSource || []}
			rowKey="id"
			pagination={false}
			// scroll={{ x: 700 }}
		/>
	);
};

export default RMASelectProductTable;
