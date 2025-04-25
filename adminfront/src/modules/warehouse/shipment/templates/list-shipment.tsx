'use client';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import List from '@/components/List';
import { Tabs } from '@/components/Tabs';
import { Text, Title } from '@/components/Typography';
import {
	useAdminAssignShipment,
	useAdminFulfillments,
} from '@/lib/hooks/api/fulfullment';
import { Fulfillment, FulfullmentStatus } from '@/types/fulfillments';
import { ERoutes } from '@/types/routes';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';
import ShipmentItem from '../components/shipment-item';
import { message, Switch } from 'antd';
import { getErrorMessage } from '@/lib/utils';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const ListShipment: FC<Props> = ({}) => {
	const router = useRouter();

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [activeKey, setActiveKey] = useState<FulfullmentStatus>(
		FulfullmentStatus.AWAITING
	);
	const [myOrder, setMyOrder] = useState(false);

	const { fulfillments, isLoading, count } = useAdminFulfillments({
		q: searchValue || undefined,
		offset,
		limit: DEFAULT_PAGE_SIZE,
		expand: 'order,order.customer,order.shipping_address,shipper,checker',
		status: activeKey,
		isMyOrder: myOrder ? true : undefined,
	});

	const updateFulfillment = useAdminAssignShipment();

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleClickDetail = async (item: Fulfillment) => {
		return router.push(`${ERoutes.WAREHOUSE_SHIPMENT}/${item.id}`);
	};

	const items: any = [
		{
			key: FulfullmentStatus.AWAITING,
			label: 'Chờ giao',
		},
		{
			key: FulfullmentStatus.DELIVERING,
			label: 'Đang giao',
		},
		{
			key: FulfullmentStatus.SHIPPED,
			label: 'Đã giao',
		},
		{
			key: FulfullmentStatus.CANCELED,
			label: 'Đã hủy',
		},
	];

	const handleChangeTab = (key: FulfullmentStatus) => {
		setActiveKey(key);
	};

	const handleConfirm = async (item: Fulfillment) => {
		await updateFulfillment.mutateAsync(
			{
				fulfillment_id: item.id,
				status: FulfullmentStatus.DELIVERING,
			},
			{
				onSuccess: () => {
					message.success('Đã thêm vào danh sách giao hàng');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const handleRemoveHandler = async (item: Fulfillment) => {
		await updateFulfillment.mutateAsync(
			{
				fulfillment_id: item.id,
				status: FulfullmentStatus.AWAITING,
			},
			{
				onSuccess: () => {
					message.success('Đã thêm vào danh sách giao hàng');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	return (
		<Flex vertical gap={12}>
			<Flex vertical align="flex-start" className="">
				<Title level={3}>Danh sách đơn hàng</Title>
				<Text className="text-gray-600">
					Trang danh sách các đơn cần vận chuyển.
				</Text>
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
					dataSource={fulfillments}
					loading={isLoading}
					renderItem={(item: Fulfillment) => (
						<List.Item>
							<ShipmentItem
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
				/>
			</Card>
		</Flex>
	);
};

export default ListShipment;
