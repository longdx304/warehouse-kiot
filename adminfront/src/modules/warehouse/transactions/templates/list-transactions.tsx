'use client';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { useAdminWarehouseTransactions } from '@/lib/hooks/api/warehouse';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import transactionColumns from '../components/transaction-column';
import { Input } from '@/components/Input';
import { Search } from 'lucide-react';
import _ from 'lodash';
import { TransactionType } from '@/types/warehouse';
import { TableProps } from 'antd';

type Props = {};

interface DataType {
	key: React.Key;
	product_name: string;
	type: TransactionType;
	note: string;
}

const PAGE_SIZE = 50;
const ListTransaction: FC<Props> = () => {
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [type, setType] = useState<TransactionType | null>(null);
	const [startAt, setStartAt] = useState<string>('');
	const [endAt, setEndAt] = useState<string>('');

	const { inventoryTransactions, count, isLoading, isRefetching } =
		useAdminWarehouseTransactions({
			limit: PAGE_SIZE,
			offset: (currentPage - 1) * PAGE_SIZE,
			q: searchValue || undefined,
			type: type || undefined,
			start_at: startAt || undefined,
			end_at: endAt || undefined,
		});

	const columns = useMemo(() => {
		return transactionColumns({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;

			// Update search query
			setSearchValue(inputValue);
		},
		500
	);

	const onChange: TableProps<DataType>['onChange'] = (
		pagination,
		filters,
		sorter,
		extra
	) => {
		// Handle created_at filter
		const createdAtFilter = filters?.created_at;
		if (Array.isArray(createdAtFilter) && createdAtFilter.length === 2) {
			setStartAt(createdAtFilter[0] as string);
			setEndAt(createdAtFilter[1] as string);
		}

		// Handle type filter
		const typeFilter = filters?.type;
		if (Array.isArray(typeFilter)) {
			if (typeFilter.length === 1) {
				setType(typeFilter[0] as TransactionType);
			} else {
				setType(null);
			}
		} else {
			setType(null);
		}
	};

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="mb-4">
				<Title level={3}>Sổ kho</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					placeholder="Tìm kiếm đơn hàng..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={inventoryTransactions}
				rowKey="code"
				scroll={{ x: 700 }}
				onChange={onChange as any}
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage as number,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} đơn hàng`,
				}}
			/>
		</Card>
	);
};

export default ListTransaction;
