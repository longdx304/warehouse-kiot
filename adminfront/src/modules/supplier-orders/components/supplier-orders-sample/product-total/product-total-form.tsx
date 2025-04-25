import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
// import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { formatNumber } from '@/lib/utils';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { Col, Row, Table } from 'antd';
import { FC, useMemo, useState } from 'react';
import { ItemQuantity } from '..';
import productTotalColumns from './product-total-columns';

type Props = {
	selectedRowProducts: PricedVariant[] | undefined;
	itemQuantities: ItemQuantity[];
	setCurrentStep: (step: number) => void;
};

/**
 * Component to show total price of selected products
 * @param selectedProducts list of selected product ids
 * @param itemQuantities list of item quantities
 * @param itemPrices list of item prices
 * @param setCurrentStep function to set current step
 * @returns JSX element
 */

const PAGE_SIZE = 10;

const ProductTotalForm: FC<Props> = ({
	selectedRowProducts,
	itemQuantities,
	setCurrentStep,
}) => {
	const [currentPage, setCurrentPage] = useState(1);

	// updated the newest value
	const columns = useMemo(
		() =>
			productTotalColumns({
				itemQuantities,
				currentPage,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[itemQuantities, selectedRowProducts, currentPage]
	);

	const handleBack = () => {
		setCurrentStep(0);
	};

	const handleContinue = () => {
		setCurrentStep(2);
	};

	const handleTableChange = (pagination: any, filters: any, sorter: any) => {
		setCurrentPage(pagination.current);
	};

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
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
						Tổng tiền
					</Title>
				</Flex>
			</Col>
			<Col span={24} id="table-product">
				<Flex className="flex-col" gap={12}>
					<Table
						columns={columns as any}
						dataSource={selectedRowProducts}
						rowKey="id"
						scroll={{ x: 700 }}
						pagination={{
							current: currentPage,
							pageSize: PAGE_SIZE,
							total: selectedRowProducts?.length,
							showSizeChanger: false,
							onChange: handleChangePage,
						}}
						summary={() => (
							<Table.Summary fixed>
								<Table.Summary.Row>
									<Table.Summary.Cell index={0} />
									<Table.Summary.Cell index={1}>
										{selectedRowProducts?.length} (sản phẩm)
									</Table.Summary.Cell>
									<Table.Summary.Cell index={2} className="text-center">
										{formatNumber(
											itemQuantities.reduce(
												(total, item) => total + item.quantity,
												0
											)
										)}{' '}
										(đôi)
									</Table.Summary.Cell>
								</Table.Summary.Row>
							</Table.Summary>
						)}
					/>
				</Flex>
			</Col>
			<Col span={24}>
				<Flex justify="flex-end" gap="small" className="mt-4">
					<Button type="default" onClick={handleBack}>
						Quay lại
					</Button>
					<Button onClick={handleContinue} data-testid="next-step">
						Tiếp tục
					</Button>
				</Flex>
			</Col>
		</Row>
	);
};

export default ProductTotalForm;
