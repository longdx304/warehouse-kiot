'use client';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Title } from '@/components/Typography';
import { CircleAlert, Plus, Search } from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import _ from 'lodash';
import { Card } from '@/components/Card';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Table } from '@/components/Table';
import { FloatButton } from '@/components/Button';
import { useAdminPriceLists, useMedusa } from 'medusa-react';
import pricingColumns from './pricing-column';
import PricingCreate from '@/modules/pricing/components/pricing-modal/pricing-create';
import { Modal, message } from 'antd';
import { getErrorMessage } from '@/lib/utils';
import { PriceList } from '@medusajs/medusa';
import PriceDetailModal from '../components/pricing-detail-modal';
import PriceProductModal from '../components/pricing-product-modal';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const PricingList: FC<Props> = ({}) => {
	const { client } = useMedusa();
	const {
		state: statePricing,
		onOpen: onOpenPricing,
		onClose: onClosePricing,
	} = useToggleState(false);
	const {
		state: statePriceDetail,
		onOpen: onOpenPriceDetail,
		onClose: onClosePriceDetail,
	} = useToggleState(false);
	const {
		state: statePriceList,
		onOpen: onOpenPriceList,
		onClose: onClosePriceList,
	} = useToggleState(false);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentPricing, setCurrentPricing] = useState<PriceList | null>(null);

	const { price_lists, isLoading, isRefetching, count, refetch } =
		useAdminPriceLists({
			offset,
			limit: DEFAULT_PAGE_SIZE,
			q: searchValue || undefined,
			expand: 'customer_groups',
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

	const handleEditPricing = (record: PriceList) => {
		setCurrentPricing(record);
		onOpenPriceDetail();
	};

	const handleListProduct = (record: PriceList) => {
		setCurrentPricing(record);
		onOpenPriceList();
	};

	const handleChangeStatue = (record: PriceList) => {
		const { id, status } = record;
		const statusValue = status === 'draft' ? 'active' : 'draft';
		if (status) {
			// @ts-ignore
			client.admin.priceLists
				.update(id, {
					status: statusValue as any,
				})
				.then(() => {
					message.success('Cập nhật trạng thái thành công');
					refetch();
				})
				.catch((err) => {
					message.error(getErrorMessage(err));
				});
		}
	};

	const handleDeletePricing = (id: string) => {
		Modal.confirm({
			title: 'Xác nhận muốn xoá định giá này?',
			content: 'Bạn có chắc chắn muốn xóa định giá này không?',
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
				client.admin.priceLists
					.delete(id)
					.then(() => {
						message.success('Xoá định giá thành công');
						refetch();
					})
					.catch((err) => {
						message.error(getErrorMessage(err));
					});
			},
			onCancel() {},
		});
	};

	const columns = useMemo(() => {
		return pricingColumns({
			handleEditPricing,
			handleChangeStatue,
			handleDeletePricing,
			handleListProduct,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [price_lists]);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Quản lý định giá</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					placeholder="Tìm kiếm bộ sưu tập..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={price_lists ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} bộ sưu tập`,
				}}
			/>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} />}
				type="primary"
				onClick={onOpenPricing}
				data-testid="btn-add-customer-group"
			/>
			<PricingCreate
				state={statePricing}
				handleOk={onClosePricing}
				handleCancel={onClosePricing}
			/>
			{/* Chỉnh sửa thông tin price list */}
			{currentPricing && statePriceDetail && (
				<PriceDetailModal
					state={statePriceDetail}
					handleOk={() => onClosePriceDetail()}
					handleCancel={() => onClosePriceDetail()}
					priceList={currentPricing}
				/>
			)}
			{/* Danh sách sản phẩm */}
			{currentPricing && statePriceList && (
				<PriceProductModal
					state={statePriceList}
					handleOk={() => onClosePriceList()}
					handleCancel={() => onClosePriceList()}
					id={currentPricing.id}
				/>
			)}
		</Card>
	);
};

export default PricingList;
