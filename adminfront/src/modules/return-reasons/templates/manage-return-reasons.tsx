'use client';
import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { ReturnReason } from '@medusajs/medusa';
import { Modal as AntdModal, message } from 'antd';
import _ from 'lodash';
import { Plus, Search } from 'lucide-react';
import { useAdminReturnReasons, useMedusa } from 'medusa-react';
import { ChangeEvent, useMemo, useState } from 'react';
import ReasonModal from '../components/reason-modal';
import returnReasonsColumns from './return-reasons-column';

type Props = {};

const ReturnList = ({}: Props) => {
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentReturnReason, setCurrentReturnReason] =
		useState<ReturnReason | null>(null);
	const { client } = useMedusa();

	const { isLoading, return_reasons, refetch, isRefetching } =
		useAdminReturnReasons({
			onSuccess: (data) => {
				// sorting is done in place
				sortByCreatedAt(data.return_reasons);
			},
		});

	const {
		state: stateReturnReason,
		onOpen: onOpenReturnReason,
		onClose: onCloseReturnReason,
	} = useToggleState(false);

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleEditReturnReason = (record: ReturnReason) => {
		setCurrentReturnReason(record);
		onOpenReturnReason();
	};

	const handleDeleteReturnReason = (recordId: ReturnReason['id']) => {
		AntdModal.confirm({
			title: 'Xác nhận xóa lý do trả hàng',
			content: 'Bạn có chắc chắn muốn xóa lý do trả hàng này?',
			onOk: async () => {
				await client.admin.returnReasons
					.delete(recordId)
					.then(() => {
						message.success('Xóa lý do trả hàng thành công');
						refetch();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
			},
		});
	};

	const columns = useMemo(() => {
		return returnReasonsColumns({
			handleEditReturnReason,
			handleDeleteReturnReason,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [return_reasons]);

	const filteredReturnReasons = useMemo(() => {
		if (!searchValue.trim()) {
			return return_reasons;
		}
		return return_reasons?.filter(
			(reason) =>
				reason.label.toLowerCase().includes(searchValue.toLowerCase()) ||
				reason.description?.toLowerCase().includes(searchValue.toLowerCase())
		);
	}, [return_reasons, searchValue]);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="">
				<Title level={3}>Lý do trả hàng</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Input
					placeholder="Tìm kiếm lý do trả hàng..."
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
				onClick={onOpenReturnReason}
				data-testid="btnCreateAccount"
			/>

			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={filteredReturnReasons ?? []}
				rowKey="id"
				scroll={{ x: 700 }}
			/>

			<ReasonModal
				state={stateReturnReason}
				handleOk={() => {
					onCloseReturnReason();
					setCurrentReturnReason(null);
				}}
				handleCancel={() => {
					onCloseReturnReason();
					setCurrentReturnReason(null);
				}}
				returnReason={currentReturnReason!}
			/>
		</Card>
	);
};

export default ReturnList;

const sortByCreatedAt = <T extends Record<string, any>>(returnReasons: T[]) =>
	returnReasons?.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
