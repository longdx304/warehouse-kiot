'use client';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Input, TextArea } from '@/components/Input';
import List from '@/components/List';
import { Tabs } from '@/components/Tabs';
import { Text, Title } from '@/components/Typography';
import { useAdminProductInboundConfirmById } from '@/lib/hooks/api/product-inbound';
import { useAdminProductInbound } from '@/lib/hooks/api/product-inbound/queries';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { useUser } from '@/lib/providers/user-provider';
import { getErrorMessage } from '@/lib/utils';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { LineItem } from '@/types/lineItem';
import { ERoutes } from '@/types/routes';
import { FulfillSupplierOrderStt } from '@/types/supplier';
import { message, TabsProps } from 'antd';
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import debounce from 'lodash/debounce';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { useAdminCreateNote } from 'medusa-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import ConfirmOrder from '../../components/confirm-order';
import InboundDetailItem from '../components/inbound-detail-item';
import InboundModal from '../components/inbound-modal';
import Notes from '../components/notes';

type Props = {
	id: string;
};

const DEFAULT_PAGE_SIZE = 10;
const InboundDetail: FC<Props> = ({ id }) => {
	const router = useRouter();
	const { user } = useUser();
	const { state, onOpen, onClose } = useToggleState();
	const [searchValue, setSearchValue] = useState<string>('');
	const [variantId, setVariantId] = useState<string | null>(null);
	const [selectedItem, setSelectedItem] = useState<LineItem | null>(null);
	const { supplierOrder, isLoading, refetch } = useAdminProductInbound(id);
	const confirmInboundProduct = useAdminProductInboundConfirmById(id);
	const createNote = useAdminCreateNote();

	const {
		state: confirmState,
		onOpen: onOpenConfirm,
		onClose: onCloseConfirm,
	} = useToggleState(false);
	const [noteInput, setNoteInput] = useState<string>('');

	const [activeKey, setActiveKey] = useState<FulfillSupplierOrderStt>(
		FulfillSupplierOrderStt.DELIVERED
	);

	const isPermission = useMemo(() => {
		if (!user) return false;
		if (
			supplierOrder?.fulfillment_status === FulfillSupplierOrderStt.INVENTORIED
		)
			return false;
		if (user.role === 'admin' || supplierOrder?.handler_id === user.id)
			return true;
		return false;
	}, [user, supplierOrder]);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangeTab = (key: string) => {
		setActiveKey(key as FulfillSupplierOrderStt);
	};

	const lineItems = useMemo(() => {
		if (!supplierOrder?.items) return [];

		const itemsByStatus = supplierOrder.items.filter((item: LineItem) => {
			const warehouse_quantity = item.warehouse_quantity ?? 0;
			if (activeKey === FulfillSupplierOrderStt.INVENTORIED) {
				return warehouse_quantity === item.quantity;
			}
			return warehouse_quantity < item.quantity;
		});

		return itemsByStatus
			.filter((item: LineItem) => {
				const title = item.title.toLowerCase();
				const description = item?.description?.toLowerCase();
				const search = searchValue.toLowerCase();
				return title.includes(search) || description?.includes(search);
			})
			.sort((a, b) => {
				return (
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				);
			});
	}, [supplierOrder?.items, searchValue, activeKey]);

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
		router.push(ERoutes.WAREHOUSE_INBOUND);
	};

	const handleComplete = async () => {
		const isProcessing = supplierOrder?.items.some(
			(item) => item.warehouse_quantity < 0
		);
		if (isProcessing) {
			message.error('Tồn tại sản phẩm đang xuất kho');
			return;
		}

		const isUnsufficientQuantity = supplierOrder?.items.some(
			(item) => item.warehouse_quantity < item.quantity
		);

		if (isUnsufficientQuantity && isEmpty(noteInput)) {
			message.error(
				'Số lượng nhập kho không đúng với số lượng giao của đơn hàng. Vui lòng thêm ghi chú nếu muốn hoàn thành đơn'
			);
			return;
		}

		await confirmInboundProduct.mutateAsync(void 0, {
			onSuccess: () => {
				message.success('Đã đánh dấu nhập hàng thành công');
				refetch();

				onWriteNote();

				onCloseConfirm();
			},
			onError: (error: any) => {
				message.error(getErrorMessage(error));
			},
		});
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
				resource_id: supplierOrder?.id!,
				resource_type: 'product-inbound',
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
		{
			label: 'Hoàn thành nhập hàng',
			icon: <Check size={20} />,
			onClick: onOpenConfirm,
			disabled:
				supplierOrder?.fulfillment_status ===
				FulfillSupplierOrderStt.INVENTORIED,
		},
		{
			label: 'Trang đặt hàng từ NCC',
			icon: <ArrowLeft size={20} />,
			onClick: () => {
				router.push(`${ERoutes.SUPPLIERS}/${id}`);
			},
		},
	];

	const handler = supplierOrder?.handler
		? `${supplierOrder?.handler?.first_name}`
		: 'Chưa xác định';

	return (
		<Flex vertical>
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
						<Title
							level={4}
						>{`Đơn nhập hàng #${supplierOrder?.display_id}`}</Title>
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
							<InboundDetailItem
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
							activeKey === FulfillSupplierOrderStt.DELIVERED
								? 'Đã hoàn thành tất cả sản phẩm. Hãy kiểm tra tại tab "Đã hoàn thành"'
								: 'Chưa có sản phẩm nào hoàn thành. Hãy kiểm tra tại tab "Đang thực hiện"',
					}}
				/>
				{state && variantId && selectedItem && (
					<InboundModal
						open={state}
						onClose={handleClose}
						variantId={variantId as string}
						item={selectedItem}
						isPermission={isPermission}
					/>
				)}
			</Card>
			<Notes orderId={id} type="INBOUND" />
			{confirmState && (
				<ConfirmOrder
					state={confirmState}
					title="Xác nhận hoàn thành nhập kho"
					handleOk={handleComplete}
					handleCancel={onCloseConfirm}
				>
					{/* Danh sách san pham */}
					{supplierOrder?.items.map((item, idx) => {
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

export default InboundDetail;

const FulfillmentLine = ({ item }: { item: LineItem }) => {
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
							{`${item.variant.title}${
								item.variant.sku ? ` (${item.variant.sku})` : ''
							}`}
						</span>
					)}
				</div>
			</div>
			<div className="flex items-center">
				<span className="flex text-gray-500 text-xs">
					<span
						className={clsx('pr-1', {
							'text-red-500': item.warehouse_quantity < 0,
						})}
					>
						{item.warehouse_quantity}
					</span>
					{'/'}
					<span className="pl-1">{item.quantity}</span>
				</span>
			</div>
		</div>
	);
};
