'use client';

import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import List from '@/components/List';
import { Tabs } from '@/components/Tabs';
import { Text, Title } from '@/components/Typography';
import {
	useAdminProductInboundHandler,
	useAdminProductInboundRemoveHandler,
} from '@/lib/hooks/api/product-inbound/mutations';
import { useAdminProductInbounds } from '@/lib/hooks/api/product-inbound/queries';
import { getErrorMessage } from '@/lib/utils';
import { ERoutes } from '@/types/routes';
import { FulfillSupplierOrderStt, SupplierOrder } from '@/types/supplier';
import { message, TabsProps } from 'antd';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';
import InboundItem from '../components/inbound-item';
import { Switch } from '@/components/Switch';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;
const ListInbound: FC<Props> = ({}) => {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [activeKey, setActiveKey] = useState<FulfillSupplierOrderStt | null>(
		FulfillSupplierOrderStt.DELIVERED
	);
	const [myOrder, setMyOrder] = useState(false);

	const { supplierOrder, isLoading, count } = useAdminProductInbounds({
		q: searchValue || undefined,
		offset,
		limit: DEFAULT_PAGE_SIZE,
		status: activeKey || undefined,
		myOrder: myOrder ? true : undefined,
	});
	const productInboundHandler = useAdminProductInboundHandler();
	const productInboundRemoveHandler = useAdminProductInboundRemoveHandler();

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleChangeTab = (key: string) => {
		setActiveKey(key as FulfillSupplierOrderStt);
	};


	const items: TabsProps['items'] = [
		{
			key: FulfillSupplierOrderStt.DELIVERED,
			label: 'Đang thực hiện',
		},
		{
			key: FulfillSupplierOrderStt.INVENTORIED,
			label: 'Đã hoàn thành',
		},
	];

	const handleClickDetail = async (item: SupplierOrder) => {
		return router.push(`${ERoutes.WAREHOUSE_INBOUND}/${item.id}`);
	};

	const handleConfirm = async (item: SupplierOrder) => {
		await productInboundHandler.mutateAsync(
			{ id: item.id },
			{
				onSuccess: () => {
					router.push(`${ERoutes.WAREHOUSE_INBOUND}/${item.id}`);
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const handleRemoveHandler = async (item: SupplierOrder) => {
		await productInboundRemoveHandler.mutateAsync(
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
				<Title level={3}>Đơn nhập kho</Title>
				<Text className="text-gray-600">Trang danh sách các đơn nhập kho.</Text>
			</Flex>
			<Card loading={false} className="w-full" bordered={false}>
				<Title level={4}>Theo dõi các đơn hàng</Title>
				<Flex align="center" justify="space-between" className="py-4">
					<Flex align="center" gap={8}>
						<Text className="text-gray-700 font-medium">Đơn hàng của tôi</Text>
						<Switch
							checked={myOrder}
							onChange={(checked) => setMyOrder(checked)}
						/>
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
					defaultActiveKey={activeKey as string}
					items={items}
					onChange={handleChangeTab}
					centered
				/>
				<List
					grid={{ gutter: 12, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 5 }}
					dataSource={supplierOrder}
					loading={isLoading || productInboundHandler.isLoading}
					renderItem={(item: SupplierOrder) => (
						<List.Item>
							<InboundItem
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
							`${range[0]}-${range[1]} trong ${total} đơn nhập`,
					}}
					locale={{
						emptyText:
							activeKey === FulfillSupplierOrderStt.DELIVERED
								? 'Đã hoàn thành tất cả đơn hàng. Hãy kiểm tra tại tab "Đã hoàn thành"'
								: 'Chưa có đơn hàng nào hoàn thành. Hãy kiểm tra tại tab "Đang thực hiện"',
					}}
				/>
			</Card>
		</Flex>
	);
};

export default ListInbound;
