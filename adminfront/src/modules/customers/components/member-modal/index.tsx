import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { Plus, Search } from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import _ from 'lodash';
import {
	useAdminCustomerGroupCustomers,
	useAdminRemoveCustomersFromCustomerGroup,
} from 'medusa-react';
import memberColumns from './member-columns';
import { Button } from '@/components/Button';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Modal as AntdModal, message } from 'antd';
import { getErrorMessage } from '@/lib/utils';
import AddCustomerGroup from './add-customer-group';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	groupId: string;
};

const PAGE_SIZE = 10;
const MemberModal: FC<Props> = ({ state, handleOk, handleCancel, groupId }) => {
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const { state: stateCustomers, onOpen, onClose } = useToggleState(false);

	const removeCustomer = useAdminRemoveCustomersFromCustomerGroup(groupId);
	const { customers, isLoading, count } = useAdminCustomerGroupCustomers(
		groupId,
		{
			limit: PAGE_SIZE,
			offset: (currentPage - 1) * PAGE_SIZE,
			q: searchValue || undefined,
			expand: 'groups',
		},
		{
			keepPreviousData: true,
		}
	);

	const handleDeleteCustomer = (customerId: string) => {
		AntdModal.confirm({
			title: 'Xác nhận xóa khách hàng',
			content: 'Bạn có chắc chắn muốn xóa khách hàng này?',
			onOk: async () => {
				await removeCustomer.mutateAsync(
					{
						customer_ids: [{ id: customerId }],
					},
					{
						onSuccess: () => {
							message.success('Xóa khách hàng thành công');
						},
						onError: (error) => {
							message.error(getErrorMessage(error));
						},
					}
				);
			},
		});
	};

	const columns = useMemo(
		() => memberColumns({ handleDeleteCustomer }),
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

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			handleCancel={handleCancel}
			width={800}
		>
			<div id="table-customer-group">
				<Title level={3}>Khách hàng</Title>
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
					<Button
						type="primary"
						icon={<Plus size={20} />}
						className="flex justify-center items-center"
						onClick={onOpen}
						data-testid="btn-add-member"
					>
						Thay đổi khách hàng
					</Button>
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
				/>
			</div>
			<AddCustomerGroup
				state={stateCustomers}
				handleOk={() => {
					onClose();
				}}
				handleCancel={() => {
					onClose();
				}}
				groupId={groupId}
				customerIds={customers?.map((c) => c.id as string) || []}
			/>
		</Modal>
	);
};

export default MemberModal;
