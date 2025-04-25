'use client';

import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { ChangeEvent, useState } from 'react';
import debounce from 'lodash/debounce';
import GiftCardBanner from './gift-card-banner';
import { Card } from '@/components/Card';
import { useAdminGiftCards, useMedusa } from 'medusa-react';
import { Flex } from '@/components/Flex';
import { Table } from '@/components/Table';
import { GiftCard } from '@medusajs/medusa';
import { useRouter } from 'next/navigation';
import { ERoutes } from '@/types/routes';
import { FloatButton } from '@/components/Button';
import { CircleAlert, Plus, Search } from 'lucide-react';
import giftCardColumns from './columns';
import { Input } from '@/components/Input';
import CustomGiftcard from '../../components/modal/create-custom-gift-card';
import { message, Modal } from 'antd';
import { getErrorMessage } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 10;
const GiftCardList = () => {
	const router = useRouter();
	const { client } = useMedusa();
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currGiftCard, setCurrGiftCard] = useState<GiftCard | null>(null);

	const { gift_cards, isLoading, count, refetch } = useAdminGiftCards(
		{
			offset,
			q: searchValue,
			limit: DEFAULT_PAGE_SIZE,
		},
		{
			keepPreviousData: true,
		}
	);

	const { state, onOpen, onClose } = useToggleState(false);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleRowClick = (record: GiftCard) => {
		router.push(`${ERoutes.GIFT_CARDS}/${record.id}`);
	};

	const handleEdit = (record: GiftCard) => {
		setCurrGiftCard(record);
		onOpen();
	};

	const handleDelete = (recordId: GiftCard['id']) => {
		Modal.confirm({
			title: 'Xác nhận xóa thẻ quà tặng',
			content: 'Bạn có chắc chắn muốn xóa thẻ quà tặng này?',
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
				client.admin.giftCards
					.delete(recordId)
					.then(() => {
						message.success('Xoá thẻ quà tặng thành công!');
						refetch();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
	};

	const columns = giftCardColumns({ handleEdit, handleDelete });

	return (
		<div className="w-full flex flex-col gap-2 mt-2">
			<div className="flex flex-col gap-1 px-2 sm:px-0">
				<Title level={2}>Thẻ quà tặng</Title>
				<Text className="text-gray-500">
					Quản lý thẻ quà tặng của cửa hàng của bạn
				</Text>
			</div>
			<GiftCardBanner />
			<Card className="w-full mt-4" bordered={false} loading={isLoading}>
				<Flex vertical align="flex-start" justify="flex-start" className="">
					<Title level={3}>Lịch sử</Title>
					<Text className="text-gray-500">
						Xem lịch sử các thẻ quà tặng đã mua
					</Text>
				</Flex>
				<Flex align="center" justify="flex-end" className="pb-4">
					<Input
						// size="small"
						name="search"
						placeholder="Tìm kiếm gift card..."
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
						className="w-[300px]"
					/>
				</Flex>
				<Table
					loading={isLoading}
					columns={columns as any}
					dataSource={gift_cards ?? []}
					rowKey="id"
					scroll={{ x: 700 }}
					onRow={(record) => ({
						onClick: () => handleRowClick(record as any),
						className: 'cursor-pointer',
					})}
					pagination={{
						total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
						pageSize: DEFAULT_PAGE_SIZE,
						current: numPages || 1,
						onChange: handleChangePage,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} đơn hàng`,
					}}
				/>
				<FloatButton
					className="top-1/3"
					icon={<Plus color="white" size={20} />}
					type="primary"
					onClick={onOpen}
					data-testid="btnCreate"
				/>
			</Card>
			{state && (
				<CustomGiftcard
					open={state}
					onClose={onClose}
					giftCard={currGiftCard}
				/>
			)}
		</div>
	);
};

export default GiftCardList;
