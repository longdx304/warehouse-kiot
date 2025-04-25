'use client';
import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { Region } from '@medusajs/medusa';
import { Modal as AntdModal, message } from 'antd';
import _ from 'lodash';
import { Plus, Search } from 'lucide-react';
import { useAdminRegions, useMedusa } from 'medusa-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import RegionModal from '../components/region-modal';
import ShippingModal from '../components/shipping-modal';
import regionColumns from './region-column';

type Props = {};

const DEFAULT_PAGE_SIZE = 10;

const RegionList: FC<Props> = () => {
	const {
		state: stateShipping,
		onOpen: onOpenShipping,
		onClose: onCloseShipping,
	} = useToggleState(false);
	const {
		state: stateActionRegion,
		onOpen: onOpenActionRegion,
		onClose: onCloseActionRegion,
	} = useToggleState(false);
	const { client } = useMedusa();

	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);
	const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
	const [regionId, setRegionId] = useState<Region['id'] | null>(null);

	const { regions, isLoading, isRefetching, count, refetch } = useAdminRegions(
		{
			offset,
			limit: DEFAULT_PAGE_SIZE,
			q: searchValue || undefined,
		},
		{ keepPreviousData: true }
	);

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

	const handleEditRegion = (record: Region) => {
		setCurrentRegion(record);
		onOpenActionRegion();
	};

	const handleShippingOption = (record: Region) => {
		setRegionId(record.id);
		onOpenShipping();
	};

	const handleDeleteRegion = (recordId: Region['id']) => {
		AntdModal.confirm({
			title: 'Xác nhận xóa khu vực',
			content: 'Bạn có chắc chắn muốn xóa khu vực này?',
			onOk: async () => {
				await client.admin.regions
					.delete(recordId)
					.then(() => {
						message.success('Xóa khu vực thành công');
						refetch();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
	};

	const columns = useMemo(() => {
		return regionColumns({
			handleEditRegion,
			handleShippingOption,
			// handleReturnShippingOption,
			handleDeleteRegion,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [regions]);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Khu vực</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					placeholder="Tìm kiếm khu vực..."
					name="search"
					prefix={<Search size={16} />}
					onChange={handleChangeDebounce}
					className="w-[300px]"
				/>
			</Flex>
			<FloatButton
				className="absolute"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={onOpenActionRegion}
				data-testid="btnCreateAccount"
			/>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={regions ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
				pagination={{
					total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
					pageSize: DEFAULT_PAGE_SIZE,
					current: numPages || 1,
					onChange: handleChangePage,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} trong ${total} khu vực`,
				}}
			/>
			<RegionModal
				state={stateActionRegion}
				handleOk={() => {
					onCloseActionRegion();
					setCurrentRegion(null);
				}}
				handleCancel={() => {
					onCloseActionRegion();
					setCurrentRegion(null);
				}}
				region={currentRegion || undefined}
			/>
			<ShippingModal
				state={stateShipping}
				handleOk={() => {
					onCloseShipping();
					setRegionId(null);
				}}
				handleCancel={() => {
					onCloseShipping();
					setRegionId(null);
				}}
				regionId={regionId ?? ''}
			/>
		</Card>
	);
};

export default RegionList;
