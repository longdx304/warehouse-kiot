'use client';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Title } from '@/components/Typography';
import { Plus, Search } from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import _ from 'lodash';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Table } from '@/components/Table';
import { useAdminCustomerGroups, useMedusa } from 'medusa-react';
import { CustomerGroup } from '@medusajs/medusa';
import customerGroupColumns from './customer-group-column';
import { FloatButton } from '@/components/Button';
import CustomerGroupModal from '../../components/customer-group-modal';
import { Modal, message } from 'antd';
import { getErrorMessage } from '@/lib/utils';
import MemberModal from '../../components/member-modal';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const CustomerGroupList: FC<Props> = ({}) => {
	const { client } = useMedusa();
	const {
		state: stateCustomers,
		onOpen: onOpenCustomers,
		onClose: onCloseCustomers,
	} = useToggleState(false);
	const {
		state: stateMembers,
		onOpen: onOpenMembers,
		onClose: onCloseMembers,
	} = useToggleState(false);

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [customerGroup, setCustomerGroup] = useState<CustomerGroup | null>(
		null
	);

	const { customer_groups, isLoading, isRefetching, count, refetch } =
		useAdminCustomerGroups(
			{
				offset,
				limit: DEFAULT_PAGE_SIZE,
				q: searchValue || undefined,
				expand: 'customers',
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

	const handleEditCustomers = (record: CustomerGroup) => {
		setCustomerGroup(record);
		onOpenCustomers();
	};

	const handleMembers = (record: CustomerGroup) => {
		setCustomerGroup(record);
		onOpenMembers();
	};

	const handleDeleteCustomers = (id: CustomerGroup['id']) => {
		Modal.confirm({
			title: 'Xác nhận xóa nhóm khách hàng',
			content: 'Bạn có chắc chắn muốn xóa nhóm khách hàng này?',
			async onOk() {
				await client.admin.customerGroups
					.delete(id)
					.then(() => {
						refetch();
						message.success('Xóa nhóm khách hàng thành công');
					})
					.catch((err) => {
						message.error(getErrorMessage(err));
					});
			},
			onCancel() {
				return;
			},
		});
	};

	const columns = useMemo(() => {
		return customerGroupColumns({
			handleEditCustomers,
			handleMembers,
			handleDeleteCustomers,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customer_groups]);

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
				dataSource={customer_groups ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} nhóm khách hàng`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} />}
				type="primary"
				onClick={onOpenCustomers}
				data-testid="btn-add-customer-group"
			/>
			{stateCustomers && (
				<CustomerGroupModal
					state={stateCustomers}
					handleOk={() => {
						onCloseCustomers();
						setCustomerGroup(null);
					}}
					handleCancel={() => {
						onCloseCustomers();
						setCustomerGroup(null);
					}}
					customerGroup={customerGroup}
				/>
			)}
			{customerGroup && stateMembers && (
				<MemberModal
					state={stateMembers}
					handleOk={() => {
						onCloseMembers();
						setCustomerGroup(null);
					}}
					handleCancel={() => {
						onCloseMembers();
						setCustomerGroup(null);
					}}
					groupId={customerGroup.id}
				/>
			)}
		</div>
	);
};

export default CustomerGroupList;
