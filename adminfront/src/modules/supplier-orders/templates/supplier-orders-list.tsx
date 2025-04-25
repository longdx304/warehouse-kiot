'use client';

import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { useAdminSuppliers } from '@/lib/hooks/api/supplier';
import { useAdminSupplierOrders } from '@/lib/hooks/api/supplier-order';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { ERoutes } from '@/types/routes';
import { SupplierOrders } from '@/types/supplier';
import { FloatButton, TableProps } from 'antd';
import _ from 'lodash';
import { NotepadTextDashed, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import SupplierOrdersModal from '../components/supplier-orders-modal';
import supplierOrdersColumn from './supplier-order-column';
import { Tooltip } from '@/components/Tooltip';
import SupplierOrdersSample from '../components/supplier-orders-sample';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const SupplierOrdersList: FC<Props> = () => {
	const {
		state: stateSupplierOrdersModal,
		onOpen: openSupplierOrdersModal,
		onClose: closeSupplierOrdersModal,
	} = useToggleState(false);

	const {
		state: stateSampleOrderModal,
		onOpen: openSampleOrderModal,
		onClose: closeSampleOrderModal,
	} = useToggleState(false);

	const router = useRouter();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentSupplierOrders, setCurrentSupplierOrders] =
		useState<SupplierOrders | null>(null);
	const [filters, setFilters] = useState<any>({});

	const { supplierOrders, isLoading, isRefetching, count } =
		useAdminSupplierOrders({
			q: searchValue || '',
			status: filters.status || undefined,
			fulfillment_status: filters.fulfillment_status || undefined,
			offset,
			limit: DEFAULT_PAGE_SIZE,
		});

	// fetch suppliers for choosing supplier in order
	const { suppliers } = useAdminSuppliers({
		q: '',
		offset,
		limit: 100,
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

	const handleCreateSupplierOrders = () => {
		setCurrentSupplierOrders(null);
		openSupplierOrdersModal();
	};

	const handleOpenSampleOrderModal = () => {
		openSampleOrderModal();
	};

	const columns = useMemo(() => {
		return supplierOrdersColumn({
			supplier: suppliers ?? [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [suppliers]);

	const handleCloseModal = () => {
		closeSupplierOrdersModal();
		setCurrentSupplierOrders(null);
	};

	const handleCloseSampleOrderModal = () => {
		closeSampleOrderModal();
	};

	const handleRowClick = (record: any) => {
		router.push(`${ERoutes.SUPPLIER_ORDERS}/${record.id}`);
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
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Đơn đặt hàng</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					placeholder="Tìm kiếm đơn đặt hàng..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={(columns as any) ?? []}
				dataSource={supplierOrders ?? []}
				rowKey="id"
				onRow={(record) => ({
					onClick: () => handleRowClick(record),
					className: 'cursor-pointer',
				})}
				scroll={{ x: 700 }}
				onChange={handleOnChange}
				pagination={{
					total: count ?? 0,
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} đơn hàng`,
				}}
			/>

			<FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
				<Tooltip title="Tạo đơn đặt hàng" placement="left">
					<FloatButton
						icon={<Plus color="white" size={20} strokeWidth={2} />}
						type="primary"
						onClick={handleCreateSupplierOrders}
						data-testid="btnCreateSupplier"
					/>
				</Tooltip>
				<Tooltip title="Tạo bản mẫu đơn đặt hàng" placement="left">
					<FloatButton
						icon={<NotepadTextDashed color="black" size={20} strokeWidth={2} />}
						type="default"
						onClick={handleOpenSampleOrderModal}
						data-testid="btnAnotherAction"
					/>
				</Tooltip>
			</FloatButton.Group>
			{stateSupplierOrdersModal && (
				<SupplierOrdersModal
					state={stateSupplierOrdersModal}
					handleOk={handleCloseModal}
					handleCancel={handleCloseModal}
					suppliers={suppliers || []}
				/>
			)}

			{stateSampleOrderModal && (
				<SupplierOrdersSample
					state={stateSampleOrderModal}
					handleOk={handleCloseSampleOrderModal}
					handleCancel={handleCloseSampleOrderModal}
					suppliers={suppliers || []}
				/>
			)}
		</Card>
	);
};

export default SupplierOrdersList;
