'use client';

import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import {
	useAdminDeleteSupplier,
	useAdminSuppliers,
} from '@/lib/hooks/api/supplier';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Supplier } from '@/types/supplier';
import { message, Modal } from 'antd';
import _ from 'lodash';
import { CircleAlert, Plus, Search } from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import supplierColumn from '../components/supplier-column';
import SupplierModal from '../components/supplier-modal';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const SupplierList: FC<Props> = () => {
	const {
		state: stateSupplierModal,
		onOpen: openSupplierModal,
		onClose: closeSupplierModal,
	} = useToggleState(false);

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);

	const deleteSupplier = useAdminDeleteSupplier();
	const {
		suppliers,
		isLoading,
		isRefetching,
		count: supplierCount,
	} = useAdminSuppliers({
		q: searchValue || '',
		offset,
		limit: DEFAULT_PAGE_SIZE,
	});

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

	const handleEditSupplier = (record: Supplier) => {
		setCurrentSupplier(record);
		openSupplierModal();
	};

	const handleCreateSupplier = () => {
		setCurrentSupplier(null);
		openSupplierModal();
	};

	const handleDeleteSupplier = (record: Supplier['id']) => {
		Modal.confirm({
			title: 'Bạn có muốn xoá nhà cung cấp này không ?',
			content:
				'Nhân viên sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá nhà cung cấp này chứ?',
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
				await deleteSupplier.mutateAsync(record, {
					onSuccess: () => {
						message.success('Xoá nhà cung cấp thành công!');
						return;
					},
					onError: () => {
						message.error('Xoá nhà cung cấp thất bại!');
						return;
					},
				});
			},
		});
	};

	const handleCloseModal = () => {
		closeSupplierModal();
		setCurrentSupplier(null);
	};

	const columns = useMemo(() => {
		return supplierColumn({
			handleEditSupplier,
			handleDeleteSupplier,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Nhà Cung Cấp</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					placeholder="Tìm kiếm nhà cung cấp..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={suppliers ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: supplierCount ?? 0,
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} nhà cung cấp`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={handleCreateSupplier}
				data-testid="btnCreateSupplier"
			/>
			{stateSupplierModal && (
				<SupplierModal
					state={stateSupplierModal}
					handleOk={handleCloseModal}
					handleCancel={handleCloseModal}
					supplier={currentSupplier!}
				/>
			)}
		</Card>
	);
};

export default SupplierList;
