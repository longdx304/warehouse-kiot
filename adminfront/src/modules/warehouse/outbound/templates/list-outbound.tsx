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
	useAdminProductOutboundHandler,
	useAdminProductOutboundRemoveHandler,
	useAdminProductOutbounds,
} from '@/lib/hooks/api/product-outbound';
import { getErrorMessage } from '@/lib/utils';
import { FulfillmentStatus } from '@/types/fulfillments';
import { ERoutes } from '@/types/routes';
import { Order } from '@medusajs/medusa';
import { message, TabsProps } from 'antd';
import debounce from 'lodash/debounce';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';
import OutboundItem from '../components/outbound-item';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;
const ListOutbound: FC<Props> = ({ }) => {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
	const [activeKey, setActiveKey] = useState<string>(
		FulfillmentStatus.NOT_FULFILLED
	);
	const [myOrder, setMyOrder] = useState(false);

	const { orders, isLoading, count } = useAdminProductOutbounds({
		q: searchValue || undefined,
		offset,
		limit: DEFAULT_PAGE_SIZE,
		fulfillment_status: activeKey,
		isMyOrder: myOrder ? true : undefined,
		order: sortOrder === 'DESC' ? '-created_at' : 'created_at',
	});
	const productOutboundHandler = useAdminProductOutboundHandler();
	const productOutboundRemoveHandler = useAdminProductOutboundRemoveHandler();

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleChangeTab = (key: string) => {
		setActiveKey(key);
	};

	const items: TabsProps['items'] = [
		{
			key: FulfillmentStatus.NOT_FULFILLED,
			label: 'Đang thực hiện',
		},
		{
			key: `${FulfillmentStatus.FULFILLED},${FulfillmentStatus.EXPORTED}`,
			label: 'Đã hoàn thành',
		},
	];

	const handleClickDetail = async (item: Order) => {
		return router.push(`${ERoutes.WAREHOUSE_OUTBOUND}/${item.id}`);
	};

	const handleConfirm = async (item: Order) => {
		await productOutboundHandler.mutateAsync(
			{ id: item.id },
			{
				onSuccess: () => {
					router.push(`${ERoutes.WAREHOUSE_OUTBOUND}/${item.id}`);
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const handleRemoveHandler = async (item: Order) => {
		await productOutboundRemoveHandler.mutateAsync(
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
				<Title level={3}>Đơn hàng</Title>
				<Text className="text-gray-600">Trang danh sách các đơn xuất kho.</Text>
			</Flex>
			<Card loading={false} className="w-full" bordered={false}>
				<Title level={4}>Theo dõi các đơn hàng</Title>
				<Flex align="center" justify="space-between" className="py-4 lg:flex-row flex-col">
					<Flex align="center" gap={8} className="py-2">
						<Text className="text-gray-700 font-medium">Đơn hàng của tôi</Text>
						<Switch
							checked={myOrder}
							onChange={(checked) => setMyOrder(checked)}
						/>
						<Button
							onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
							className="ml-4 flex items-center gap-2"
							icon={sortOrder === 'ASC' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
						>
							{sortOrder === 'ASC' ? 'Cũ nhất' : 'Mới nhất'}
						</Button>
					</Flex>
					<Input
						placeholder="Tìm kiếm đơn nhập kho..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				<Tabs
					defaultActiveKey={activeKey}
					items={items}
					onChange={handleChangeTab}
					centered
				/>
				<List
					grid={{ gutter: 12, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }}
					dataSource={orders}
					loading={isLoading}
					renderItem={(item: Order) => (
						<List.Item>
							<OutboundItem
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
						emptyText:
							activeKey === FulfillmentStatus.NOT_FULFILLED
								? 'Đã hoàn thành tất cả đơn hàng. Hãy kiểm tra tại tab "Đã hoàn thành"'
								: 'Chưa có đơn hàng nào hoàn thành. Hãy kiểm tra tại tab "Đang thực hiện"',
					}}
				/>
			</Card>
		</Flex>
	);
};

export default ListOutbound;
