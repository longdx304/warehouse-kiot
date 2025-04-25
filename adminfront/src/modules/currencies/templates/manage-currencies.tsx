'use client';
import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Table } from '@/components/Table';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { Currency } from '@medusajs/medusa';
import { Modal as AntdModal, message } from 'antd';
import _ from 'lodash';
import { Plus } from 'lucide-react';
import { useAdminStore, useAdminUpdateStore } from 'medusa-react';
import { FC, useMemo } from 'react';
import CurrencyModal from '../components/currency-modal';
import currencyColumns from './currency-column';

type Props = {};

const CurrencyList: FC<Props> = () => {
	const {
		state: stateActionCurrency,
		onOpen: onOpenActionCurrency,
		onClose: onCloseActionCurrency,
	} = useToggleState(false);

	const { store, isLoading, isRefetching, refetch } = useAdminStore();

	const mutateUpdateStore = useAdminUpdateStore();

	const handleDeleteCurrency = (recordId: Currency['code']) => {
		const currencies = store?.currencies
			.filter((sc) => sc.code !== recordId)
			.map((c) => c.code);

		AntdModal.confirm({
			title: 'Xác nhận xóa tiền tệ này',
			content: 'Bạn có chắc chắn muốn xóa tiền tệ này?',
			onOk: async () => {
				await mutateUpdateStore.mutateAsync(
					{
						currencies: currencies,
					},
					{
						onSuccess: () => {
							message.success('Xóa tiền tệ thành công');
							refetch();
						},
						onError: (error: any) => {
							message.error(getErrorMessage(error));
						},
					}
				);
			},
		});
	};
	const handleSetDefaultCurrency = async (recordId: Currency['code']) => {
		await mutateUpdateStore.mutateAsync(
			{
				default_currency_code: recordId,
			},
			{
				onSuccess: () => {
					message.success('Đặt tiền tệ mặc định thành công');
					refetch();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	const columns = useMemo(() => {
		return currencyColumns({
			handleSetDefaultCurrency,
			handleDeleteCurrency,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [store?.currencies]);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="mb-4">
				<Title level={3}>Tiền tệ</Title>
			</Flex>
			<Flex align="center" justify="flex-end" className="pb-4">
				<Text className="mr-4">
					Tiền tệ mặc định: {store?.default_currency_code?.toUpperCase()}
				</Text>
			</Flex>
			<FloatButton
				className="absolute top-3"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={onOpenActionCurrency}
				data-testid="btnCreateAccount"
			/>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={store?.currencies ?? []}
				rowKey="code"
				scroll={{ x: 700 }}
				rowSelection={{
					type: 'radio',
					selectedRowKeys: [store?.default_currency_code ?? 'usd'],
					getCheckboxProps: () => ({
						disabled: true,
					}),
				}}
				pagination={false}
			/>
			<CurrencyModal
				state={stateActionCurrency}
				handleOk={() => {
					onCloseActionCurrency();
				}}
				handleCancel={() => {
					onCloseActionCurrency();
				}}
				currentCurrencies={store?.currencies ?? undefined}
			/>
		</Card>
	);
};

export default CurrencyList;
