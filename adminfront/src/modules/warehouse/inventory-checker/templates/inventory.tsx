'use client';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Text, Title } from '@/components/Typography';
import { useAdminWarehousesInventoryVariant } from '@/lib/hooks/api/warehouse';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { ChangeEvent, FC, useState } from 'react';
import { inventoryColumns } from './columns';

type Props = {};

const DEFAULT_PAGE_SIZE = 20;

const InventoryChecker: FC<Props> = ({}) => {
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);

	const { data, isLoading, refetch } = useAdminWarehousesInventoryVariant({
		q: searchValue || undefined,
		limit: DEFAULT_PAGE_SIZE,
		offset,
	});

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		if (inputValue === '') {
			setOffset(0);
			setNumPages(1);
			setSearchValue(inputValue);
			refetch();
			return;
		}
		setSearchValue(inputValue.trim());
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};
	const columns = inventoryColumns({});

	return (
		<Flex vertical gap={12}>
			<Flex vertical align="flex-start" className="">
				<Title level={3}>Danh sách vị trí kho</Title>
				<Text className="text-gray-600">
					Trang danh sách các sản phẩm ở từng vị trí kho.
				</Text>
			</Flex>
			<Card loading={false} className="w-full" bordered={false}>
				<Title level={4}>Vị trí kho</Title>
				<Flex align="center" justify="flex-end" className="py-4">
					<Input
						placeholder="Tìm kiếm vị trí hoặc sản phẩm..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				<Table
					dataSource={data}
					loading={isLoading}
					rowKey="id"
					columns={columns as any}
					pagination={{
						onChange: (page) => handleChangePage(page),
						pageSize: DEFAULT_PAGE_SIZE,
						current: numPages || 1,
						// total: count,
						// showTotal: (total, range) =>
						// 	`${range[0]}-${range[1]} trong ${total} vị trí`,
					}}
				/>
			</Card>
		</Flex>
	);
};

export default InventoryChecker;
