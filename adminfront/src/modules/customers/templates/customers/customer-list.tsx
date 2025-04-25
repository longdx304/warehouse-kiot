'use client';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Customer } from '@medusajs/medusa';
import _ from 'lodash';
import { Search } from 'lucide-react';
import { useAdminCustomers } from 'medusa-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import EditCustomerModal from '../../components/edit-customer-modal';
import OrdersModal from '../../components/orders-modal';
import customerColumns from './customer-column';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const CustomerList: FC<Props> = ({}) => {
	const {
		state: stateOrders,
		onOpen: onOpenOrders,
		onClose: onCloseOrders,
	} = useToggleState(false);
	const {
		state: stateEditCustomer,
		onOpen: onOpenEditCustomer,
		onClose: onCloseEditCustomer,
	} = useToggleState(false);

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

	const { customers, isLoading, isRefetching, count } = useAdminCustomers(
		{
			offset,
			limit: DEFAULT_PAGE_SIZE,
			q: searchValue || undefined,
			expand: 'orders',
		},
		{ keepPreviousData: true }
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

	const handleEditCustomer = (record: Customer) => {
		setCurrentCustomer(record);
		onOpenEditCustomer();
	};

	const handleViewOrder = (record: Customer) => {
		setCurrentCustomer(record);
		onOpenOrders();
	};

	const columns = useMemo(() => {
		return customerColumns({
			handleEditCustomer,
			handleViewOrder,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customers]);

	return (
		<div className="w-full">
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Khách hàng</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					placeholder="Tìm kiếm khách hàng..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={customers ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} khách hàng`,
				}}
			/>
			{currentCustomer && stateEditCustomer && (
				<EditCustomerModal
					state={stateEditCustomer}
					handleOk={() => {
						onCloseEditCustomer();
						setCurrentCustomer(null);
					}}
					handleCancel={() => {
						onCloseEditCustomer();
						setCurrentCustomer(null);
					}}
					customer={currentCustomer}
				/>
			)}
			{currentCustomer && stateOrders && (
				<OrdersModal
					state={stateOrders}
					handleOk={() => {
						onCloseOrders();
						setCurrentCustomer(null);
					}}
					handleCancel={() => {
						onCloseOrders();
						setCurrentCustomer(null);
					}}
					customerId={currentCustomer.id}
				/>
			)}
		</div>
	);
};

export default CustomerList;
