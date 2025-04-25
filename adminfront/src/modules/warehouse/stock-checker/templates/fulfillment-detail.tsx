'use client';
import { splitFiles } from '@/actions/images';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Image } from '@/components/Image';
import { Input, TextArea } from '@/components/Input';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { Text } from '@/components/Typography';
import UploadTemplate from '@/components/Upload/UploadTemplate';
import {
	useAdminProductOutbound,
	useAdminProductOutboundCheck,
	useAdminUpdateProductOutbound,
} from '@/lib/hooks/api/product-outbound';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { FormImage } from '@/types/common';
import { FulfillmentStatus } from '@/types/fulfillments';
import { LineItem } from '@/types/lineItem';
import { Order } from '@/types/order';
import { ERoutes } from '@/types/routes';
import { AdminPostOrdersOrderFulfillmentsReq } from '@medusajs/medusa';
import { Divider, message } from 'antd';
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import debounce from 'lodash/debounce';
import {
	ArrowLeft,
	Check,
	Clock,
	Hash,
	MapPin,
	Search,
	UserCheck,
} from 'lucide-react';
import { useAdminCreateFulfillment, useAdminCreateNote } from 'medusa-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import ConfirmOrder from '../../components/confirm-order';
import fulfillmentColumns from './columns';
import { useUser } from '@/lib/providers/user-provider';

type FulfillmentDetailProps = {
	id: string;
};

const FulfillmentDetail = ({ id }: FulfillmentDetailProps) => {
	const router = useRouter();
	const { user } = useUser();

	const [searchValue, setSearchValue] = useState<string>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [prevSelectedKeys, setPrevSelectedKeys] = useState<string[]>([]);
	const [files, setFiles] = useState<FormImage[]>([]);

	const {
		state: confirmState,
		onOpen: onOpenConfirm,
		onClose: onCloseConfirm,
	} = useToggleState(false);
	const [noteInput, setNoteInput] = useState<string>('');

	const createOrderFulfillment = useAdminCreateFulfillment(id);
	const updateProductOutbound = useAdminUpdateProductOutbound(id);
	const createNote = useAdminCreateNote();
	const {
		order,
		isLoading: isLoadingOrder,
		refetch,
	} = useAdminProductOutbound(id);
	const checkFulfillment = useAdminProductOutboundCheck();
	const uploadFile = useAdminUploadFile();

	const isProcessing =
		order?.fulfillment_status !== FulfillmentStatus.FULFILLED;

	const isPermission = useMemo(() => {
		if (!user) return false;
		if (user.role === 'admin' || order?.checker_id === user.id) return true;
		return false;
	}, [user, order?.checker_id]);

	const handleRowSelectionChange = (selectedRowKeys: string[]) => {
		// Find newly selected and unselected items by comparing with previous state
		const newlySelected = selectedRowKeys.filter(key => !prevSelectedKeys.includes(key));
		const newlyUnselected = prevSelectedKeys.filter(key => !selectedRowKeys.includes(key));

		// Update states
		setSelectedRowKeys(selectedRowKeys);
		setPrevSelectedKeys(selectedRowKeys);

		// Handle newly selected items
		if (newlySelected.length > 0) {
			handleCheckFulfillment(newlySelected);
		}

		// Handle newly unselected items
		if (newlyUnselected.length > 0) {
			handleUncheckFulfillment(newlyUnselected);
		}
	};

	const handleCheckFulfillment = async (itemIds: string[]) => {
		await checkFulfillment.mutateAsync({ id, itemId: itemIds, checked: true });
		refetch();
	};

	const handleUncheckFulfillment = async (itemIds: string[]) => {
		await checkFulfillment.mutateAsync({ id, itemId: itemIds, checked: false });
		refetch();
	};

	const updateCheckboxesFromMetadata = () => {
		if (isProcessing && order) {
			// Select items that have metadata with is_outbound=true
			const checkedItems = order.items
				.filter((item) => item.metadata?.is_outbound === true)
				.map((item) => item.id);

			if (checkedItems.length > 0) {
				setSelectedRowKeys(checkedItems);
			}
		}
	};

	useEffect(() => {
		if (!isProcessing && order) {
			// Map item IDs for selection
			const items = order.items.map((item) => item.id);
			setSelectedRowKeys(items);

			// Handle checker_url if it exists
			if (order?.checker_url?.length) {
				setFiles(
					order.checker_url.split(',').map((url, index) => ({
						id: url,
						url,
						name: `Ảnh #${index + 1}`,
					}))
				);
			}
		}

		updateCheckboxesFromMetadata();
		//eslint-disable-next-line
	}, [order?.checker_url, order]);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const itemTable = useMemo(() => {
		if (!order) return [];
		const items = order?.items?.filter((item: any) =>
			item?.title?.toLowerCase()?.includes(searchValue.toLowerCase())
		);

		return items;
	}, [order, searchValue]);

	const handleBackToList = () => {
		router.push(ERoutes.WAREHOUSE_STOCK_CHECKER);
	};

	const onConfirm = async () => {
		if (selectedRowKeys?.length !== itemTable?.length) {
			message.warning('Vui lòng kiểm hết sản phẩm trước khi xác nhận');
			return;
		}
		if (files.length === 0) {
			message.warning('Vui lòng tải lên hình ảnh sản phẩm');
			return;
		}
		if (
			(order?.fulfillment_status as FulfillmentStatus) !==
			FulfillmentStatus.EXPORTED
		) {
			message.warning('Đơn hàng chưa được xác nhận xuất kho');
			return;
		}

		onOpenConfirm();
		return;
	};

	if (!order) return null;

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

	// Function upload images
	const handleUploadFile = async () => {
		const { uploadImages } = splitFiles(files);

		// Split images into chunks of maximum 5 images each
		const CHUNK_SIZE = 10;
		const chunks: File[][] = [];

		for (let i = 0; i < uploadImages.length; i += CHUNK_SIZE) {
			chunks.push(uploadImages.slice(i, i + CHUNK_SIZE));
		}

		// Create an array of upload promises
		const uploadPromises = chunks.map(async (chunk) => {
			try {
				const { uploads } = await uploadFile.mutateAsync({
					files: chunk,
					prefix: 'warehouse/stock-checker',
				});
				console.log('🚀 ~ uploadPromises ~ uploads:', uploads);
				return uploads.map((item) => item.url);
			} catch (error) {
				console.error('Error uploading chunk:', error);
				throw error;
			}
		});

		// Show loading message
		const loadingMessage = message.loading('Đang tải lên hình ảnh...', 0);

		try {
			// Wait for all chunks to be uploaded
			const results = await Promise.all(uploadPromises);

			// Flatten the array of URLs
			const allUrls = results.flat();
			return allUrls.join(',');
		} catch (error) {
			return null;
		} finally {
			// Close loading message
			loadingMessage();
		}
	};

	// Function update checker_url & checked_at
	const handleCompleteChecker = (filesUrl: string) => {
		updateProductOutbound.mutate(
			{
				checker_url: filesUrl,
				checked_at: new Date().toISOString(),
			},
			{
				onSuccess: () => {
					refetch();
				},
				onError: (err: any) => message.error(getErrorMessage(err)),
			}
		);
	};
	const handleComplete = async () => {
		let action: any = createOrderFulfillment;
		let successText = 'Đơn hàng đã được kiêm hàng thành công.';
		let requestObj;

		requestObj = {
			no_notification: false,
		} as AdminPostOrdersOrderFulfillmentsReq;

		requestObj.items = (order?.items as LineItem[])
			?.filter(
				(item: LineItem) =>
					item?.warehouse_quantity - (item.fulfilled_quantity ?? 0) > 0
			)
			.map((item: LineItem) => ({
				item_id: item.id,
				quantity: item?.warehouse_quantity - (item.fulfilled_quantity ?? 0),
			}));

		const isUnsufficientQuantity = (order?.items as LineItem[]).some(
			(item) => item.warehouse_quantity < item.quantity
		);

		if (isUnsufficientQuantity && isEmpty(noteInput)) {
			message.error(
				'Số lượng xuất kho không đúng với số lượng giao của đơn hàng. Vui lòng thêm ghi chú nếu muốn hoàn thành đơn'
			);
			return;
		}

		// Check upload file before create fulfillment
		const filesUrl = await handleUploadFile();
		console.log('🚀 ~ handleComplete ~ filesUrl:', filesUrl);
		if (!filesUrl) {
			message.error('Có lỗi xảy ra khi tải ảnh lên');
			return;
		}

		await action.mutateAsync(requestObj as any, {
			onSuccess: () => {
				message.success(successText);
				refetch();

				handleCompleteChecker(filesUrl);

				onWriteNote();

				onCloseConfirm();
			},
			onError: (err: any) => message.error(getErrorMessage(err)),
		});
	};

	const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;

		setNoteInput(inputValue);
	};

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
			<Card loading={isLoadingOrder} className="w-full mb-10" rounded>
				<OrderInfo order={order!} isProcessing={isProcessing} />
				<Flex
					vertical
					align="flex-end"
					justify="flex-end"
					className="py-4"
					gap={4}
				>
					<Flex
						gap={4}
						align="center"
						justify="space-between"
						className="w-full"
					>
						<Button
							onClick={() => {
								refetch().then(() => {
									updateCheckboxesFromMetadata();
								});
							}}
							icon={<Clock size={16} />}
							className="text-sm flex items-center"
						>
							Làm mới
						</Button>

						<Input
							placeholder="Tìm kiếm sản phẩm..."
							name="search"
							prefix={<Search size={16} />}
							onChange={handleChangeDebounce}
							className="w-full sm:w-[300px]"
						/>
					</Flex>

					<Text className="text-gray-500 text-xs">{`Đã kiểm ${
						selectedRowKeys?.length ?? 0
					} trong ${itemTable?.length}`}</Text>
					<Table
						columns={fulfillmentColumns as any}
						dataSource={itemTable}
						rowKey="id"
						showHeader={false}
						rowSelection={{
							type: 'checkbox',
							selectedRowKeys: selectedRowKeys,
							onChange: handleRowSelectionChange as any,
							preserveSelectedRowKeys: true,
							getCheckboxProps: (record: any) => ({
								disabled:
									!isProcessing ||
									record?.warehouse_quantity !== record.quantity ||
									!isPermission,
							}),
						}}
					/>
					<Divider />
					{isPermission && (
						<UploadTemplate
							files={files}
							setFiles={setFiles}
							hiddenUpload={!isProcessing}
						/>
					)}

					<Button
						disabled={!isProcessing || !isPermission}
						onClick={onConfirm}
						loading={
							createOrderFulfillment.isLoading ||
							uploadFile.isLoading ||
							updateProductOutbound.isLoading
						}
						type="primary"
						className="w-full sm:w-[200px]"
					>
						{isProcessing ? 'Kiểm hàng' : 'Đã kiểm hàng'}
					</Button>
				</Flex>
			</Card>
			{confirmState && (
				<ConfirmOrder
					state={confirmState}
					title="Xác nhận hoàn kiểm hàng xuất kho"
					handleOk={handleComplete}
					handleCancel={onCloseConfirm}
					isLoading={
						createOrderFulfillment.isLoading ||
						uploadFile.isLoading ||
						updateProductOutbound.isLoading
					}
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

export default FulfillmentDetail;

const OrderInfo = ({
	order,
	isProcessing = false,
}: {
	order: Order;
	isProcessing: boolean;
}) => {
	// Get shipping address from the order
	const shippingAddressId = order.shipping_address_id;
	const billingAddressId = order.billing_address_id;

	// Format address based on available data
	let address = '';

	// Try to construct address from shipping_address if it exists
	if (order.shipping_address) {
		address = [
			order.shipping_address.address_2,
			order.shipping_address.city,
			order.shipping_address.address_1,
			order.shipping_address.province,
			order.shipping_address.country_code,
		]
			.filter(Boolean)
			.join(', ');
	} else {
		// Fallback address display
		address = `Shipping Address ID: ${
			shippingAddressId || 'N/A'
		}, Billing Address ID: ${billingAddressId || 'N/A'}`;
	}

	// Get customer information
	const customerName = order.customer
		? `${order.customer.last_name || ''} ${
				order.customer.first_name || ''
		  }`.trim()
		: '';
	const customerPhone = order.customer?.phone || '';

	const checker = order?.checker
		? `${order?.checker?.first_name}`
		: 'Chưa xác định';

	return (
		<div>
			<Tag
				color={isProcessing ? 'gold' : 'green'}
				className="w-fit flex items-center gap-1 p-2 rounded-lg mb-2"
			>
				<span className="text-[14px] font-semibold">
					{isProcessing ? 'Chờ kiểm hàng' : 'Đã kiểm hàng'}
				</span>
				{isProcessing ? <Clock size={16} /> : <Check />}
			</Tag>
			<Flex vertical gap={4} className="mt-2">
				<Flex gap={4} className="" align="center">
					<div className="flex items-center">
						<Hash size={14} color="#6b7280" />
					</div>
					<Text className="text-sm font-semibold">
						{`${order?.display_id || ''} ${
							customerName ? `- ${customerName}` : ''
						} ${customerPhone ? `- ${customerPhone}` : ''}`}
					</Text>
				</Flex>
				<Flex gap={4} className="" align="center">
					<div className="flex items-center">
						<MapPin color="#6b7280" width={18} height={18} />
					</div>
					<Text className="text-sm font-semibold">{address}</Text>
				</Flex>
				<Flex gap={4} className="" align="center">
					<div className="flex items-center">
						<UserCheck color="#6b7280" width={18} height={18} />
					</div>
					<Text className="text-sm font-semibold">
						{`Người kiểm hàng: ${checker}`}
					</Text>
				</Flex>
			</Flex>
		</div>
	);
};

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
