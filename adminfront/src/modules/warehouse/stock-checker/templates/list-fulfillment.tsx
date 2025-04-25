'use client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import List from '@/components/List';
import { Switch } from '@/components/Switch';
import { Tabs } from '@/components/Tabs';
import { Text, Title } from '@/components/Typography';
import {
	useAdminCheckerStocks,
	useAdminStockAssignChecker,
	useAdminStockRemoveChecker,
} from '@/lib/hooks/api/product-outbound';
import { getErrorMessage } from '@/lib/utils';
import { FulfillmentStatus } from '@/types/fulfillments';
import { Order } from '@/types/order';
import { ERoutes } from '@/types/routes';
import { message } from 'antd';
import debounce from 'lodash/debounce';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';
import StockItem from '../components/stock-item';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const ListFulfillment: FC<Props> = ({}) => {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [activeKey, setActiveKey] = useState<string>(
		`${FulfillmentStatus.NOT_FULFILLED},${FulfillmentStatus.EXPORTED}`
	);
	const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
	const [myOrder, setMyOrder] = useState(false);

	const stockAssignChecker = useAdminStockAssignChecker();
	const stockRemoveChecker = useAdminStockRemoveChecker();

	const { orders, isLoading, count } = useAdminCheckerStocks({
		q: searchValue || undefined,
		offset,
		limit: DEFAULT_PAGE_SIZE,
		fulfillment_status: activeKey,
		isMyOrder: myOrder ? true : undefined,
		order: sortOrder === 'DESC' ? '-handled_at' : 'handled_at',
	});

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const items: any = [
		{
			key: `${FulfillmentStatus.NOT_FULFILLED},${FulfillmentStatus.EXPORTED}`,
			label: 'Chờ kiểm hàng',
		},
		{
			key: FulfillmentStatus.FULFILLED,
			label: 'Đã kiểm hàng',
		},
	];

	const handleChangeTab = (key: string) => {
		setActiveKey(key);
	};

	const handleClickDetail = async (item: Order) => {
		return router.push(`${ERoutes.WAREHOUSE_STOCK_CHECKER}/${item.id}`);
	};

	const handleConfirm = async (item: Order) => {
		await stockAssignChecker.mutateAsync(
			{ id: item.id },
			{
				onSuccess: () => {
					router.push(`${ERoutes.WAREHOUSE_STOCK_CHECKER}/${item.id}`);
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const handleRemoveHandler = async (item: Order) => {
		await stockRemoveChecker.mutateAsync(
			{ id: item.id },
			{
				onSuccess: () => {
					message.success('Huỷ bỏ xử lý đơn hàng thành công');
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	return (
		<Flex vertical gap={12}>
			<Flex vertical align="flex-start" className="">
				<Title level={3}>Danh sách đơn hàng</Title>
				<Text className="text-gray-600">
					Trang danh sách các đơn cần kiểm hàng.
				</Text>
			</Flex>
			<Card loading={false} className="w-full" bordered={false}>
				<Title level={4}>Theo dõi các đơn hàng</Title>
				<Flex
					align="center"
					justify="space-between"
					className="py-4 lg:flex-row flex-col"
				>
					<Flex align="center" gap={8}>
						<Text className="text-gray-700 font-medium">Đơn hàng của tôi</Text>
						<Switch
							checked={myOrder}
							onChange={(checked) => setMyOrder(checked)}
						/>
						<Button
							onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
							className="ml-4 flex items-center gap-2"
							icon={
								sortOrder === 'ASC' ? (
									<ArrowUp size={16} />
								) : (
									<ArrowDown size={16} />
								)
							}
						>
							{sortOrder === 'ASC' ? 'Cũ nhất' : 'Mới nhất'}
						</Button>
					</Flex>
					<Input
						placeholder="Tìm kiếm đơn hàng..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				<Tabs
					defaultActiveKey={activeKey as any}
					items={items}
					onChange={handleChangeTab as any}
					centered
				/>
				<List
					grid={{ gutter: 12, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }}
					dataSource={orders}
					loading={isLoading}
					renderItem={(item: Order) => (
						<List.Item>
							<StockItem
								item={item}
								handleClickDetail={handleClickDetail}
								handleConfirm={handleConfirm}
								handleRemoveHandler={handleRemoveHandler}
							/>
						</List.Item>
					)}
					pagination={{
						onChange: (page) => handleChangePage(page),
						pageSize: DEFAULT_PAGE_SIZE,
						current: numPages || 1,
						total: count,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} đơn hàng`,
					}}
					locale={{
						emptyText: !activeKey
							? 'Đã hoàn thành tất cả đơn hàng. Hãy kiểm tra tại tab "Đã kiểm hàng"'
							: 'Chưa có đơn hàng nào hoàn thành. Hãy kiểm tra tại tab "Chờ kiểm hàng"',
					}}
				/>
			</Card>
		</Flex>
	);
};

export default ListFulfillment;
