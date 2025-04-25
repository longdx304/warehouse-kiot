'use client';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input, TextArea } from '@/components/Input';
import List from '@/components/List';
import { Tabs } from '@/components/Tabs';
import { Text, Title } from '@/components/Typography';
import {
	useAdminProductOutbound,
	useAdminUpdateProductOutbound,
} from '@/lib/hooks/api/product-outbound';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { ERoutes } from '@/types/routes';
import { TabsProps } from 'antd';
import debounce from 'lodash/debounce';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import OutboundDetailItem from '../components/outbound-detail-item';
// import { FulfillmentStatus } from '@/types/order';
import { ActionAbles } from '@/components/Dropdown';
import { useUser } from '@/lib/providers/user-provider';
import { getErrorMessage } from '@/lib/utils';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { FulfillmentStatus } from '@/types/fulfillments';
import { LineItem } from '@/types/lineItem';
import { message } from 'antd';
import clsx from 'clsx';
import { useAdminCreateNote } from 'medusa-react';
import Image from 'next/image';
import ConfirmOrder from '../../components/confirm-order';
import Notes from '../../inbound/components/notes';
import OutboundModal from '../components/outbound-modal';
import dayjs from 'dayjs';

type Props = {
	id: string;
};

const DEFAULT_PAGE_SIZE = 10;
const OutboundDetail: FC<Props> = ({ id }) => {
	const router = useRouter();
	const { user } = useUser();
	const { state, onOpen, onClose } = useToggleState();
	const [searchValue, setSearchValue] = useState<string>('');
	const [variantId, setVariantId] = useState<string | null>(null);
	const [selectedItem, setSelectedItem] = useState<LineItem | null>(null);
	const { order, isLoading, refetch } = useAdminProductOutbound(id);
	const updateProductOutbound = useAdminUpdateProductOutbound(id);

	const createNote = useAdminCreateNote();

	const {
		state: confirmState,
		onOpen: onOpenConfirm,
		onClose: onCloseConfirm,
	} = useToggleState(false);
	const [noteInput, setNoteInput] = useState<string>('');

	const isPermission = useMemo(() => {
		if (!user) return false;
		if (user.role === 'admin' || order?.handler_id === user.id) return true;
		return false;
	}, [user, order?.handler_id]);

	const [activeKey, setActiveKey] = useState<FulfillmentStatus>(
		FulfillmentStatus.NOT_FULFILLED
	);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangeTab = (key: string) => {
		setActiveKey(key as FulfillmentStatus);
	};

	const lineItems = useMemo(() => {
		if (!order?.items) return [];

		const itemsByStatus = order.items.filter((item: any) => {
			const lineItem = item as LineItem;
			const warehouse_quantity = lineItem.warehouse_quantity ?? 0;
			if (activeKey === FulfillmentStatus.FULFILLED) {
				return warehouse_quantity === item.quantity;
			}
			return warehouse_quantity !== item.quantity;
		});

		return itemsByStatus
			.filter((item: any) => {
				const lineItem = item as LineItem;
				const title = lineItem.title.toLowerCase();
				const description = lineItem?.description?.toLowerCase();
				const search = searchValue.toLowerCase();
				return title.includes(search) || description?.includes(search);
			})
			.sort((a, b) => {
				return (
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				);
			});
	}, [order?.items, searchValue, activeKey]);

	const items: TabsProps['items'] = [
		{
			key: FulfillmentStatus.NOT_FULFILLED,
			label: 'Đang thực hiện',
		},
		{
			key: FulfillmentStatus.FULFILLED,
			label: 'Đã hoàn thành',
		},
	];

	const handleClickDetail = (id: string | null, item: LineItem) => {
		setVariantId(id);
		setSelectedItem(item);
		onOpen();
	};

	const handleClose = () => {
		setVariantId(null);
		onClose();
	};

	const handleBackToList = () => {
		router.push(ERoutes.WAREHOUSE_OUTBOUND);
	};

	const handleComplete = async () => {
		await updateProductOutbound.mutateAsync(
			{
				fulfillment_status: FulfillmentStatus.EXPORTED,
				handled_at: dayjs().format(),
			} as any,
			{
				onSuccess: () => {
					message.success('Đơn hàng đã được xuất kho');
					refetch();

					onWriteNote();

					onCloseConfirm();
				},
				onError: (err: any) => message.error(getErrorMessage(err)),
			}
		);
	};

	const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;

		setNoteInput(inputValue);
	};

	const onWriteNote = () => {
		if (!noteInput) {
			return;
		}
		createNote.mutate(
			{
				resource_id: id,
				resource_type: 'product-outbound',
				value: noteInput,
			},
			{
				onSuccess: () => {
					message.success('Ghi chú đã được tạo');
				},
				onError: (err) => message.error(getErrorMessage(err)),
			}
		);
		setNoteInput('');
	};

	const actions = [
		isPermission && {
			label: 'Hoàn thành xuất kho',
			icon: <Check size={18} />,
			onClick: onOpenConfirm,
			disabled:
				(order?.fulfillment_status as any) === FulfillmentStatus.EXPORTED,
		},
		{
			label: 'Trang Order chi tiết',
			icon: <ArrowLeft size={18} />,
			onClick: () => {
				router.push(`${ERoutes.ORDERS}/${id}`);
			},
		},
	];

	const handler = order?.handler
		? `${order?.handler?.first_name}`
		: 'Chưa xác định';

	return (
		<Flex vertical gap={12}>
			<Flex vertical align="flex-start" className="">
				<Button
					onClick={handleBackToList}
					type="text"
					icon={<ArrowLeft size={18} color="rgb(107 114 128)" />}
					className="text-gray-500 text-sm flex items-center"
				>
					Danh sách đơn hàng
				</Button>
			</Flex>
			<Card loading={false} className="w-full mb-10" bordered={false}>
				<Flex align="flex-start" justify="space-between">
					<Flex vertical>
						<Title level={4}>{`Đơn hàng #${order?.display_id}`}</Title>
						<Text className="text-gray-600">
							{`Người phụ trách: ${handler}`}
						</Text>
					</Flex>
					<ActionAbles actions={actions as any} />
				</Flex>

				<Flex align="center" justify="flex-end" className="py-4">
					<Input
						placeholder="Tìm kiếm biến thể sản phẩm..."
						name="search"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-full sm:w-[300px]"
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
					dataSource={lineItems}
					loading={isLoading}
					renderItem={(item: LineItem) => (
						<List.Item>
							<OutboundDetailItem
								item={item}
								handleClickDetail={(id) => handleClickDetail(id, item)}
							/>
						</List.Item>
					)}
					pagination={{
						pageSize: DEFAULT_PAGE_SIZE,
						total: lineItems.length,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} biến thể`,
					}}
					locale={{
						emptyText:
							activeKey === FulfillmentStatus.NOT_FULFILLED
								? 'Đã hoàn thành tất cả sản phẩm. Hãy kiểm tra tại tab "Đã hoàn thành"'
								: 'Chưa có sản phẩm nào hoàn thành. Hãy kiểm tra tại tab "Đang thực hiện"',
					}}
				/>
				{state && variantId && selectedItem && (
					<OutboundModal
						isPermission={isPermission}
						open={state}
						onClose={handleClose}
						variantId={variantId as string}
						item={selectedItem}
					/>
				)}
			</Card>
			<Notes orderId={id} type="OUTBOUND" />
			{confirmState && (
				<ConfirmOrder
					state={confirmState}
					title="Xác nhận hoàn thành xuất kho"
					handleOk={handleComplete}
					handleCancel={onCloseConfirm}
				>
					{/* Danh sách san pham */}
					{order?.items.map((item, idx) => {
						return (
							<FulfillmentLine
								item={item as LineItem}
								key={`fulfillmentLine-${idx}`}
							/>
						);
					})}

					{/* Ghi chú */}
					<TextArea
						value={noteInput}
						onChange={onChangeInput}
						placeholder="Nhập ghi chú"
						className="w-full"
					/>
				</ConfirmOrder>
			)}
		</Flex>
	);
};

export default OutboundDetail;

export const getFulfillAbleQuantity = (item: LineItem): number => {
	return item.quantity - (item.fulfilled_quantity ?? 0);
};

const FulfillmentLine = ({ item }: { item: LineItem }) => {
	if (getFulfillAbleQuantity(item) <= 0) {
		return null;
	}

	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] mb-1 flex h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item.thumbnail ? (
						<Image
							src={item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${item.title}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<div className="flex max-w-[185px] flex-col justify-center text-[12px]">
					<span className="font-normal text-gray-900 truncate">
						{item.title}
					</span>
					{item?.variant && (
						<span className="font-normal text-gray-500 truncate">
							{`${item.variant.title}${item.variant.sku ? ` (${item.variant.sku})` : ''
								}`}
						</span>
					)}
				</div>
			</div>
			<div className="flex items-center">
				<span className="flex text-gray-500 text-xs">
					<span
						className={clsx('pl-1', {
							'text-red-500':
								item.warehouse_quantity - (item.fulfilled_quantity ?? 0) >
								getFulfillAbleQuantity(item),
						})}
					>
						{item.warehouse_quantity - (item.fulfilled_quantity ?? 0)}
					</span>
					{'/'}
					<span className="pl-1">{getFulfillAbleQuantity(item)}</span>
				</span>
			</div>
		</div>
	);
};
