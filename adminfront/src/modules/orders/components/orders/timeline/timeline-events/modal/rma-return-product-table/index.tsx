import { Table } from '@/components/Table';
import React from 'react';
import productsColumns from './products-column';

type RMAReturnProductsTableProps = {
	isAdditionalItems?: boolean;
	order: any;
	itemsToAdd: any[];
	handleToAddQuantity: (value: number, itemId: string) => void;
	handleRemoveItem: (itemId: string) => void;
};

const RMAReturnProductsTable: React.FC<RMAReturnProductsTableProps> = ({
	order,
	isAdditionalItems,
	itemsToAdd,
	handleToAddQuantity = undefined,
	handleRemoveItem = false,
}) => {
	const columns = productsColumns({
		order,
		handleRemoveItem,
		handleToAddQuantity,
	} as any);

	return (
		<Table
			columns={columns as any}
			dataSource={itemsToAdd || []}
			rowKey="id"
			pagination={false}
		/>
	);
};

export default RMAReturnProductsTable;
