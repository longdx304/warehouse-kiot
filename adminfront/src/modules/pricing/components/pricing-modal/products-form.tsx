import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import { Col, Row, message } from 'antd';
import { Search } from 'lucide-react';
import { ChangeEvent, FC, useState, useMemo, useEffect } from 'react';
import _ from 'lodash';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { useAdminProducts } from 'medusa-react';
import productsColumns from './products-column';
import { Button } from '@/components/Button';

type Props = {
	setProductForm: (data: string[]) => void;
	setCurrentStep: (nextStep: number) => void;
};

const PAGE_SIZE = 10;
const ProductsForm: FC<Props> = ({ setProductForm, setCurrentStep }) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { products, isLoading, count } = useAdminProducts({
		limit: PAGE_SIZE,
		offset: (currentPage - 1) * PAGE_SIZE,
		q: searchValue || undefined,
		is_giftcard: false,
	});

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const columns = useMemo(
		() => productsColumns({}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[products]
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	const onSubmit = () => {
		const selectedRowIds = selectedRowKeys.map((key) => key as string);
		if (selectedRowIds.length === 0) {
			message.error('Phải chọn ít nhất một sản phẩm');
			return;
		}
		setProductForm(selectedRowIds);
		setCurrentStep(2);
	};

	const onBack = () => {
		setCurrentStep(0);
	};

	return (
		<Row gutter={[16, 16]} className="pt-4">
			<Col span={24}>
				<Flex
					align="center"
					justify="space-between"
					className="p-4 border-0 border-b border-solid border-gray-200"
				>
					<Title level={4} className="">
						Chọn sản phẩm
					</Title>
					<Input
						placeholder="Nhập tên sản phẩm"
						className="w-[250px] text-xs"
						size="small"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
					/>
				</Flex>
			</Col>
			<Col span={24} id="table-product">
				<Table
					rowSelection={{
						type: 'checkbox',
						selectedRowKeys: selectedRowKeys,
						onChange: handleRowSelectionChange,
						preserveSelectedRowKeys: true,
					}}
					loading={isLoading}
					columns={columns as any}
					dataSource={products ?? []}
					rowKey="id"
					pagination={{
						total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
						pageSize: PAGE_SIZE,
						current: currentPage as number,
						onChange: handleChangePage,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} sản phẩm`,
					}}
					scroll={{ x: 700 }}
				/>
			</Col>
			<Col span={24}>
				<Flex justify="flex-end" gap="small" className="mt-4">
					<Button type="default" onClick={onBack}>
						Quay lại
					</Button>
					<Button onClick={onSubmit} data-testid="add-product">
						Tiếp tục
					</Button>
				</Flex>
			</Col>
		</Row>
	);
};

export default ProductsForm;
