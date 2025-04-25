/* eslint-disable @next/next/no-img-element */
import { Product, ProductCollection } from '@medusajs/medusa';
import { Modal as AntdModal, TableColumnsType, message } from 'antd';
import _ from 'lodash';
import { CircleAlert, Dot, Search, Trash2 } from 'lucide-react';
import {
	useAdminProducts,
	useAdminRemoveProductsFromCollection,
} from 'medusa-react';
import { ChangeEvent, FC, useEffect, useState } from 'react';

import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { getErrorMessage } from '@/lib/utils';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	collection: ProductCollection | null;
};

const columns = ({ handleRemoveProduct }: any) => [
	{
		title: 'Sản phẩm',
		dataIndex: 'title',
		render: (text: string, record: Product) => (
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
			<div className="flex justify-start">
				<Dot color={status === 'published' ? '#47B881' : '#E74C3C'} />
				<span>{status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
			</div>
		),
	},
	{
		title: '',
		key: 'action',
		render: (_: string, record: Product) => (
			<Flex justify="center" align="center" className="cursor-pointer">
				<Trash2
					size={18}
					color="#FF4D4F"
					onClick={() => handleRemoveProduct(record?.id)}
				/>
			</Flex>
		),
	},
];

const PAGE_SIZE = 10;

const ManageProductModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	collection,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const { products, isLoading, isRefetching, count, refetch } =
		useAdminProducts({
			q: searchValue || undefined,
			limit: PAGE_SIZE,
			collection_id: [collection?.id ?? ''],
			offset: (currentPage - 1) * PAGE_SIZE,
			is_giftcard: false,
		});
	const removeProducts = useAdminRemoveProductsFromCollection(collection!.id);

	const handleRemoveProduct = (productId: string) => {
		AntdModal.confirm({
			title: 'Bạn có muốn xoá sản phẩm ra khỏi bộ sưu tập này không ?',
			content:
				'Sản phẩm sẽ bị xoá khỏi bộ sưu tập này. Bạn chắc chắn muốn xoá sản phẩm này chứ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				removeProducts.mutateAsync(
					{ product_ids: [productId] },
					{
						onSuccess: async () => {
							message.success('Bạn đã loại sản phẩm này ra khỏi bộ sưu tập.');
							await refetch();
							return;
						},
						onError: (error) => {
							message.error(getErrorMessage(error));
							return;
						},
					}
				);
			},
			onCancel() {},
		});
	};

	useEffect(() => {
		if (state) {
			refetch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	const columnsTable = columns({ handleRemoveProduct });

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;

			// Update search query
			setSearchValue(inputValue);
		},
		500
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<Modal
			title={'Quản lý sản phẩm'}
			open={state}
			handleOk={handleOk}
			handleCancel={handleCancel}
		>
			<Flex align="center" justify="flex-end" className="pb-4">
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
				loading={isLoading || isRefetching}
				columns={columnsTable as any}
				dataSource={products || []}
				rowKey="id"
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

export default ManageProductModal;
