import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/utils';
import { Currency } from '@medusajs/medusa';
import { Col, Row, message } from 'antd';
import { useAdminCurrencies, useAdminUpdateStore } from 'medusa-react';
import { ChangeEvent, FC, useState } from 'react';
import _ from 'lodash';
import { Table } from '@/components/Table';
import currencyColumns from './currency-column';
import { Flex } from '@/components/Flex';
import { Search } from 'lucide-react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	currentCurrencies?: Currency[] | undefined;
};

const DEFAULT_PAGE_SIZE = 10;

const CurrencyModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	currentCurrencies,
}) => {
	const { mutateAsync, isLoading: isMutating } = useAdminUpdateStore();

	const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(1);

	const { currencies, count, isLoading } = useAdminCurrencies(
		{
			q: searchValue || undefined,
			limit: DEFAULT_PAGE_SIZE,
			offset,
		},
		{
			keepPreviousData: true,
		}
	);

	const onFinish = async () => {
		mutateAsync(
			{
				currencies: [
					...(currentCurrencies?.map((curr) => curr.code) ?? []),
					...(selectedRowKeys as string[]),
				],
			},
			{
				onSuccess: () => {
					message.success('Đã thêm tiền tệ');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
		setSelectedRowKeys([]);
		handleOk();
		return;
	};

	const columns = currencyColumns({});

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

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	return (
		<Modal
			title={'Tạo mới tiền tệ'}
			open={state}
			handleOk={onFinish}
			handleCancel={handleCancel}
			isLoading={isLoading || isMutating}
			width={800}
		>
			<Row gutter={[16, 8]} className="pt-4">
				<Col xs={24}>
					<Flex align="center" justify="flex-end" className="pb-4">
						<Input
							placeholder="Tìm kiếm tiền tệ..."
							name="search"
							prefix={<Search size={16} />}
							onChange={handleChangeDebounce}
							className="w-[300px]"
						/>
					</Flex>
				</Col>
				<Table
					loading={isLoading}
					columns={columns as any}
					dataSource={currencies ?? []}
					rowKey="code"
					scroll={{ x: 700 }}
					rowSelection={{
						type: 'radio',
						selectedRowKeys: selectedRowKeys,
						onChange: handleRowSelectionChange,
						getCheckboxProps: (record: any) => ({
							disabled:
								currentCurrencies?.findIndex((c) => c.code === record.code) !==
								-1,
						}),
					}}
					pagination={{
						total: Math.floor(count ?? 0 / (DEFAULT_PAGE_SIZE ?? 0)),
						pageSize: DEFAULT_PAGE_SIZE,
						current: numPages || 1,
						onChange: handleChangePage,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} khu vực`,
					}}
				/>
			</Row>
		</Modal>
	);
};

export default CurrencyModal;
