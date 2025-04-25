import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { Search } from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import _ from 'lodash';
import { useAdminOrders } from 'medusa-react';
import ordersColumns from './order-columns';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	customerId: string;
};

const PAGE_SIZE = 10;
const OrdersModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	customerId,
}) => {
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { orders, isLoading, count } = useAdminOrders(
		{
			limit: PAGE_SIZE,
			offset: (currentPage - 1) * PAGE_SIZE,
			q: searchValue || undefined,
			customer_id: customerId,
		},
		{
			keepPreviousData: true,
		}
	);

	const columns = useMemo(
		() => ordersColumns({}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[orders]
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
		<Modal open={state} handleOk={handleOk} handleCancel={handleCancel}>
			<Title level={3}>Đơn hàng</Title>
			<Flex
				align="center"
				justify="flex-end"
				gap="middle"
				className="p-4 border-0 border-b border-solid border-gray-200"
			>
				<Input
					placeholder="Nhập tên đơn hàng"
					className="w-[250px] text-xs"
					size="small"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
				/>
			</Flex>
			<Table
				columns={columns as any}
				dataSource={orders ?? []}
				loading={isLoading}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
					pageSize: PAGE_SIZE,
					current: currentPage || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} s·∫£n ph·∫©m`,
				}}
			/>
		</Modal>
	);
};

export default OrdersModal;
