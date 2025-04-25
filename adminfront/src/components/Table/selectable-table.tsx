import { Table, TableProps } from 'antd';
import { ChangeEvent, Key, ReactNode } from 'react';
import { Flex } from '../Flex';
import { Text } from '../Typography';
import { Input } from '../Input';
import { Search } from 'lucide-react';
import {
	CustomerGroup,
	Product,
	ProductCollection,
	ProductTag,
	ProductType,
} from '@medusajs/medusa';

type SelectableTableProps<T extends object> = TableProps & {
	className?: string;
	data?: T[];
	columns: any;
	selectedRowKeys: string[];
	handleSearchDebounce: (e: ChangeEvent<HTMLInputElement>) => void;
	handleRowSelectionChange: (
		selectedRowKeys: string[],
		selectedRows: T[]
	) => void;
	count?: number;
	currentPage?: number;
	handleChangePage?: (page: number) => void;
	loadingTable?: boolean;
	tableActions?: ReactNode;
};

const PAGE_SIZE = 10;
export default function SelectableTable<
	T extends
		| Product
		| CustomerGroup
		| ProductCollection
		| ProductTag
		| ProductType
>({
	className,
	data,
	columns,
	selectedRowKeys,
	handleSearchDebounce,
	handleRowSelectionChange,
	count,
	currentPage,
	handleChangePage,
	loadingTable,
	tableActions,
	...props
}: Readonly<SelectableTableProps<T>>) {
	return (
		<>
			<Flex align="center" justify="space-between" className="mt-4 pb-4">
				<Flex align="center" justify="flex-start" gap={6}>
					<Text>{`Đã chọn ${selectedRowKeys?.length || 0}`}</Text>{' '}
					{tableActions}
				</Flex>
				<Input
					// size="small"
					placeholder="Tìm kiếm..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleSearchDebounce}
					className="w-[200px]"
				/>
			</Flex>
			<Table
				{...props}
				rowSelection={{
					type: 'checkbox',
					selectedRowKeys: selectedRowKeys,
					onChange: handleRowSelectionChange as any,
					preserveSelectedRowKeys: true,
				}}
				loading={loadingTable}
				columns={columns}
				rowKey="id"
				dataSource={data || []}
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage as number,
					onChange: handleChangePage,
					showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total}`,
				}}
			/>
		</>
	);
}
