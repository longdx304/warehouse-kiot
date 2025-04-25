import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { Search } from 'lucide-react';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import {
	useAdminAddCustomersToCustomerGroup,
	useAdminCustomers,
	useAdminRemoveCustomersFromCustomerGroup,
} from 'medusa-react';
import { getErrorMessage } from '@/lib/utils';
import addCustomerColumns from './add-customer-columns';
import { message } from 'antd';
import { Button } from '@/components/Button';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	groupId: string;
	customerIds: string[];
};

const PAGE_SIZE = 10;
const AddCustomerGroup: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	groupId,
	customerIds,
}) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const addCustomers = useAdminAddCustomersToCustomerGroup(groupId);
	const deleteCustomers = useAdminRemoveCustomersFromCustomerGroup(groupId);

	const { customers, isLoading, count } = useAdminCustomers(
		{
			limit: PAGE_SIZE,
			offset: (currentPage - 1) * PAGE_SIZE,
			q: searchValue || undefined,
			expand: 'groups',
			// groups: [groupId],
		},
		{
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (customerIds) {
			setSelectedRowKeys(customerIds);
		} else {
			setSelectedRowKeys([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customerIds]);

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	const calculateDiff = () => {
		return {
			toAdd: _.difference(selectedRowKeys, customerIds),
			toRemove: _.difference(customerIds, selectedRowKeys),
		};
	};
	const onSubmit = async () => {
		const { toAdd, toRemove } = calculateDiff();
		if (toAdd.length) {
			await addCustomers.mutateAsync(
				{
					customer_ids: toAdd.map((id) => ({ id: id as string })),
				},
				{
					onSuccess: () => {
						message.success('Thêm khách hàng thành công');
						handleOk();
					},
					onError: (error) => {
						message.error(getErrorMessage(error));
					},
				}
			);
		}
		if (toRemove.length) {
			await deleteCustomers.mutateAsync(
				{
					customer_ids: toRemove.map((id) => ({ id: id as string })),
				},
				{
					onSuccess: () => {
						message.success('Xóa khách hàng thành công');
						handleOk();
					},
					onError: (error) => {
						message.error(getErrorMessage(error));
					},
				}
			);
		}
	};

	const columns = useMemo(
		() => addCustomerColumns({}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[customers]
	);

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	const renderFooter = () => {
		return [
			<Button
				key="1"
				type="default"
				danger
				onClick={handleCancel}
				loading={addCustomers.isLoading || deleteCustomers.isLoading}
			>
				Huỷ
			</Button>,
			<Button
				key="submit"
				onClick={onSubmit}
				loading={addCustomers.isLoading || deleteCustomers.isLoading}
				data-testid="submit-button-edit-customer"
			>
				Xác nhận
			</Button>,
		];
	};

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={addCustomers.isLoading || deleteCustomers.isLoading}
			handleCancel={handleCancel}
			footer={renderFooter()}
			width={800}
		>
			<Title level={3}>Chỉnh sửa khách hàng</Title>
			<Flex
				align="center"
				justify="flex-end"
				gap="middle"
				className="p-4 border-0 border-b border-solid border-gray-200"
			>
				<Input
					placeholder="Tìm kiếm..."
					className="w-[250px] text-xs"
					size="small"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
				/>
			</Flex>
			<Table
				columns={columns as any}
				dataSource={customers ?? []}
				loading={isLoading}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} khách hàng`,
				}}
				rowSelection={{
					type: 'checkbox',
					selectedRowKeys: selectedRowKeys,
					onChange: handleRowSelectionChange,
					preserveSelectedRowKeys: true,
				}}
			/>
		</Modal>
	);
};

export default AddCustomerGroup;
