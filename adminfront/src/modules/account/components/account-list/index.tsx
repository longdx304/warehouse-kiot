'use client';
import { User } from '@medusajs/medusa';
import { Modal, message } from 'antd';
import { CircleAlert, Plus, Search } from 'lucide-react';
import { useAdminDeleteUser } from 'medusa-react';
import { ChangeEvent, useMemo, useState } from 'react';

import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { UserModal } from '@/modules/account/components/account-modal';
import { IAdminResponse } from '@/types/account';
import { useAdminUsers } from 'medusa-react';
import accountColumns from './account-column';
import debounce from 'lodash/debounce';

interface Props {}

const AccountList = ({}: Props) => {
	const PAGE_SIZE = 10;

	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const { users, count, isLoading, isRefetching } = useAdminUsers({
		limit: PAGE_SIZE,
		offset: (currentPage - 1) * PAGE_SIZE,
		q: searchValue || undefined,
	});

	const { state, onOpen, onClose } = useToggleState(false);
	const [currentUser, setCurrentUser] = useState<IAdminResponse | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const deleteUser = useAdminDeleteUser(userId!);

	const handleEditUser = (record: IAdminResponse) => {
		setCurrentUser(record);
		onOpen();
	};

	const handleCloseModal = () => {
		setCurrentUser(null);
		onClose();
	};

	const handleDeleteUser = (userId: User['id']) => {
		setUserId(userId);
		if (userId) {
			Modal.confirm({
				title: 'Bạn có muốn xoá nhân viên này không ?',
				content:
					'Nhân viên sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá nhân viên này chứ?',
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
					deleteUser.mutateAsync(void 0, {
						onSuccess: () => {
							setUserId(null);
							message.success('Xoá nhân viên thành công!');
							return;
						},
						onError: () => {
							message.error('Xoá nhân viên thất bại!');
							return;
						},
					});
					// setUserId(null);
				},
				onCancel() {
					setUserId(null);
				},
			});
		}
	};

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	
	const columns = useMemo(
		() => accountColumns({ handleDeleteUser, handleEditUser }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[users]
	);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;

		// Update search query
		setSearchValue(inputValue);
		setCurrentPage(1);
	}, 500);

	return (
		<Card className="w-full">
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Quản lý nhân viên</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					placeholder="Tìm kiếm nhân viên..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={users}
				rowKey="id"
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage as number,
					onChange: handleChangePage,
					showTotal: (total) => `Total ${total} items`,
					// showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={onOpen}
				data-testid="btnCreateAccount"
			/>
			<UserModal
				state={state}
				handleOk={onClose}
				handleCancel={handleCloseModal}
				user={currentUser}
			/>
		</Card>
	);
};

export default AccountList;
