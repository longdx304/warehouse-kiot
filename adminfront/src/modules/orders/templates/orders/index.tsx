'use client';
import { FloatButton } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import NewDraftOrderFormProvider from '@/modules/draft-orders/hooks/use-new-draft-form';
import { ERoutes } from '@/types/routes';
import { TableProps } from 'antd';
import _ from 'lodash';
import { Plus, Search } from 'lucide-react';
import { useAdminOrders } from 'medusa-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import NewOrderModal from '../../components/orders/new-order';
import orderColumns from './order-column';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;
const defaultQueryProps = {
	expand: 'customer,shipping_address',
	fields:
		'id,status,display_id,created_at,email,fulfillment_status,payment_status,total,currency_code',
};

const OrderList: FC<Props> = () => {
	const router = useRouter();

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [filters, setFilters] = useState<any>({});

	const {
		state: stateOrderByAdminModal,
		onOpen: openOrderByAdminModal,
		onClose: closeOrderByAdminModal,
	} = useToggleState(false);

	const { orders, isLoading, count, refetch } = useAdminOrders(
		{
			...(defaultQueryProps as any),
			q: searchValue || undefined,
			offset,
			limit: DEFAULT_PAGE_SIZE,
			payment_status: filters?.payment_status || undefined,
			fulfillment_status: filters?.fulfillment_status || undefined,
		},
		{
			keepPreviousData: true,
		}
	);

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const columns = useMemo(() => {
		return orderColumns({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orders]);

	const handleRowClick = (record: any) => {
		router.push(`${ERoutes.ORDERS}/${record.id}`);
	};

	const handleCreateOrderByAdmin = () => {
		openOrderByAdminModal();
	};

	const handleCancelOrderByAdmin = () => {
		closeOrderByAdminModal();
	};

	const handleOnChange: TableProps<any>['onChange'] = (
		pagination,
		filters,
		sorter,
		extra
	) => {
		const formattedFilters = Object.entries(filters).reduce(
			(acc, [key, value]) => {
				if (Array.isArray(value) && value.length > 0) {
					acc[key] = value.map(String);
				}
				return acc;
			},
			{} as Record<string, string[]>
		);
		setFilters(formattedFilters);
	};

	return (
		// <div className="w-full">
		<>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Đơn hàng</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					placeholder="Tìm kiếm đơn hàng..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading}
				columns={columns as any}
				dataSource={orders ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				onRow={(record) => ({
					onClick: () => handleRowClick(record),
					className: 'cursor-pointer',
				})}
				onChange={handleOnChange}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} đơn hàng`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={handleCreateOrderByAdmin}
				data-testid="btnCreateSupplier"
			/>
			{stateOrderByAdminModal && (
				<NewDraftOrderFormProvider>
					<NewOrderModal
						state={stateOrderByAdminModal}
						handleOk={handleCancelOrderByAdmin}
						handleCancel={handleCancelOrderByAdmin}
						refetch={refetch}
					/>
				</NewDraftOrderFormProvider>
			)}
		</>
	);
};

export default OrderList;
