/* eslint-disable @next/next/no-img-element */
import { ProductCollection, Product } from '@medusajs/medusa';
import { TableColumnsType } from 'antd';
import { Dot, Search } from 'lucide-react';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import _ from 'lodash';

import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { useAdminCreateCollection, useAdminProducts } from 'medusa-react';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Text } from '@/components/Typography';

type Props = {
	state: boolean;
	handleOk: (selectedProducts: DataType[]) => void;
	handleCancel: () => void;
	collection: ProductCollection | null;
	onSubmit: (selectedIds: string[]) => void;
};

export interface DataType {
	key: React.Key;
	id: string;
	title: string;
	status: string;
}

const columns: TableColumnsType<DataType> = [
	{
		title: 'Sản phẩm',
		dataIndex: 'title',
		render: (text: string, record: any) => (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				{record.thumbnail && (
					<img
						src={record.thumbnail}
						alt={text}
						style={{ width: 30, height: 40, marginRight: 8 }}
					/>
				)}
				<a>{text}</a>
			</div>
		),
	},
	{
		title: 'Trạng thái',
		dataIndex: 'status',
		render: (status: string) => (
			<div className="flex justify-center">
				<Dot color={status === 'published' ? '#47B881' : '#E74C3C'} />
				<span>{status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
			</div>
		),
	},
];

const PAGE_SIZE = 10;

const AddProductModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	collection,
	onSubmit,
}) => {
	// State to manage selected rows in the table
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');

	const { products, isLoading, isRefetching, refetch, count } =
		useAdminProducts({
			limit: PAGE_SIZE,
			offset: (currentPage - 1) * PAGE_SIZE,
			q: searchValue || undefined,
			is_giftcard: false,
		});

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	const handleSubmit = async () => {
		const selectedRowIds = selectedRowKeys.map((key) => key as string);
		onSubmit(selectedRowIds);
	};

	// Reset selected rows when modal is closed
	// Compare with the inil product in collection
	useEffect(() => {
		if (state && collection) {
			const initialSelectedKeys = collection.products.map(
				(product: Product) => product.id
			);
			setSelectedRowKeys(initialSelectedKeys);
		}
		setCurrentPage(1);
		setSearchValue('');
	}, [state, collection]);

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

	return (
		<Modal
			title={'Thêm sản phẩm'}
			open={state}
			handleOk={handleSubmit}
			handleCancel={handleCancel}
		>
			<Flex align="center" justify="space-between" className="pb-4">
				<Text>{`Đã chọn ${selectedRowKeys?.length || 0} sản phẩm`}</Text>
				<Input
					// size="small"
					placeholder="Tìm kiếm sản phẩm..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[200px]"
				/>
			</Flex>
			<Table
				rowSelection={{
					type: 'checkbox',
					selectedRowKeys: selectedRowKeys,
					onChange: handleRowSelectionChange,
					preserveSelectedRowKeys: true,
				}}
				loading={isLoading || isRefetching}
				columns={columns as any}
				rowKey="id"
				dataSource={products || []}
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage as number,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} sản phẩm`,
				}}
			/>
		</Modal>
	);
};

export default AddProductModal;
