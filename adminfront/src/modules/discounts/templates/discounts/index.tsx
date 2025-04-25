'use client';

import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { ERoutes } from '@/types/routes';
import { CircleAlert, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

import discountColumns from './discount-column';
import { Discount } from '@medusajs/medusa';
import { FloatButton } from '@/components/Button';
import { useAdminDiscounts, useMedusa } from 'medusa-react';
import { Card } from '@/components/Card';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import AddDiscountModal from '../../components/modal/add-discount';
import { DiscountFormProvider } from '../../components/discount-form/discount-form-context';
import { message, Modal } from 'antd';
import { getErrorMessage } from '@/lib/utils';
import useCopyPromotion from './use-copy-promotion';

const DEFAULT_PAGE_SIZE = 10;
const DiscountList = () => {
	const router = useRouter();
	const { client } = useMedusa();

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [loadingTabled, setLoadingTable] = useState<boolean>(false);

	const { state, onOpen, onClose } = useToggleState(false);
	const { discounts, isLoading, count, refetch } = useAdminDiscounts(
		{
			is_dynamic: false,
			expand: 'rule,rule.conditions,rule.conditions.products,regions',
			limit: DEFAULT_PAGE_SIZE,
			offset: offset,
			q: searchValue || undefined,
		},
		{
			keepPreviousData: true,
		}
	);

	const handleChangeDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleChangePage = (page: number) => {
		setNumPages(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleEdit = (record: Discount) => {
		router.push(`${ERoutes.DISCOUNTS}/${record.id}`);
	};

	const handleChangeStatus = async (id: Discount['id'], status: boolean) => {
		setLoadingTable(true);
		await client.admin.discounts
			.update(id, { is_disabled: status })
			.then(() => {
				message.success('Cập nhật trạng thái thành công');
				refetch();
			})
			.catch((error: any) => {
				message.error(getErrorMessage(error));
			});
		setLoadingTable(false);
	};

	const handleDelete = async (id: Discount['id']) => {
		setLoadingTable(true);
		Modal.confirm({
			title: 'Bạn có muốn xoá mã giảm giá này không ?',
			content:
				'Mã giảm giá sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá mã giảm giá này chứ?',

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
				await client.admin.discounts
					.delete(id)
					.then(() => {
						message.success('Xóa mã giảm giá thành công');
						refetch();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
		setLoadingTable(false);
	};

	const copyPromotion = useCopyPromotion();
	const handleDuplicate = (record: Discount) => {
		copyPromotion(record);
	};

	const columns = useMemo(() => {
		return discountColumns({
			handleEdit,
			handleChangeStatus,
			handleDelete,
			handleDuplicate,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleRowClick = (record: any) => {
		router.push(`${ERoutes.DISCOUNTS}/${record.id}`);
	};

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Giảm giá</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					// size="small"
					name="search"
					placeholder="Tìm kiếm mã giảm giá..."
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<Table
				loading={isLoading || loadingTabled}
				columns={columns as any}
				dataSource={discounts ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				onRow={(record) => ({
					onClick: () => handleRowClick(record),
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
				data-testid="btnCreateProduct"
			/>
			<DiscountFormProvider>
				{state && <AddDiscountModal state={state} handleCancel={onClose} />}
			</DiscountFormProvider>
		</Card>
	);
};

export default DiscountList;
