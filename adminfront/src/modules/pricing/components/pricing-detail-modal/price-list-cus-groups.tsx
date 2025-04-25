import { Checkbox, CheckboxGroup } from '@/components/Checkbox';
import { Input } from '@/components/Input';
import { Pagination } from '@/components/Pagination';
import { Switch } from '@/components/Switch';
import { Text, Title } from '@/components/Typography';
import { CheckboxProps, Col, Empty, Flex, Form, Row, Spin } from 'antd';
import { Search } from 'lucide-react';
import { useAdminCustomerGroups } from 'medusa-react';
import { ChangeEvent, useEffect, useState } from 'react';
import _ from 'lodash';
import { PriceList } from '@medusajs/medusa';

const PAGE_SIZE = 10;
const PriceListCustomerGroups = ({
	form,
	priceList,
}: {
	form: any;
	priceList?: PriceList;
}) => {
	const [isCustomerGroups, setIsCustomerGroups] = useState<boolean>(false);
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [checkList, setCheckList] = useState<string[]>([]);

	const { customer_groups, count, isLoading } = useAdminCustomerGroups(
		{
			q: searchValue,
			offset: (currentPage - 1) * PAGE_SIZE,
			limit: PAGE_SIZE,
			expand: 'customers',
		},
		{
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (priceList?.customer_groups?.length) {
			setIsCustomerGroups(true);
			setCheckList(
				priceList?.customer_groups?.map((item: any) => item.id! as string)
			);
			form.setFieldsValue({
				customer_groups: {
					ids: priceList?.customer_groups?.map(
						(item: any) => item.id! as string
					),
				},
			});
		}
		if (priceList?.customer_groups?.length === 0) {
			setIsCustomerGroups(false);
			setCheckList([]);
			form.setFieldsValue({
				customer_groups: {
					ids: [],
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [priceList?.customer_groups, customer_groups]);

	const checkAll = customer_groups?.length === checkList?.length;
	const indeterminate =
		checkList?.length > 0 && checkList?.length < (customer_groups?.length || 0);

	const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
		if (customer_groups?.length === 0) return;
		if (customer_groups) {
			setCheckList(
				e.target.checked
					? customer_groups?.map((item: any) => item.id! as string)
					: []
			);
			form.setFieldsValue({
				customer_groups: {
					ids: e.target.checked
						? customer_groups?.map((item: any) => item.id! as string)
						: [],
				},
			});
			return;
		}
	};

	const onChange = (list: string[]) => {
		setCheckList(list);
	};

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);
	return (
		<Row gutter={[16, 16]} className="pt-4">
			<Col span={24}>
				<Flex justify="space-between" align="center">
					<Flex vertical>
						<Text strong className="text-sm">
							Khả năng sử dụng cho khách hàng
						</Text>
						<Text className="text-[13px] text-gray-600">
							Xác định nhóm khách hàng nnào mà giá ghi đề nên áp dụng
						</Text>
					</Flex>
					<Switch
						value={isCustomerGroups}
						onChange={(checked: boolean) => setIsCustomerGroups(checked)}
						className=""
						data-tesid="customer-group"
					/>
				</Flex>
			</Col>
			{isCustomerGroups && (
				<Col
					span={24}
					className="mt-2 border border-solid border-gray-200 rounded-[6px]"
				>
					<Flex
						align="center"
						justify="space-between"
						className="p-4 border-0 border-b border-solid border-gray-200"
					>
						<Title level={4} className="">
							Nhóm khách hàng
						</Title>
						<Input
							placeholder="Nhập tên nhóm khách hàng"
							className="w-[250px] text-xs"
							prefix={<Search size={16} />}
							onChange={handleChangeDebounce}
						/>
					</Flex>
					<Flex
						align="center"
						justify="space-between"
						className="p-4 border-0 border-b border-solid border-gray-200"
					>
						<Flex align="center" justify="flex-start" gap="middle">
							<Checkbox
								indeterminate={indeterminate}
								onChange={onCheckAllChange}
								checked={checkAll}
							/>
							<Text>Tên</Text>
						</Flex>
						<Text>Thành viên</Text>
					</Flex>
					<Flex className="w-full border-0 border-b border-solid border-gray-200 ">
						{_.isEmpty(customer_groups) && (
							<Empty
								image={Empty.PRESENTED_IMAGE_DEFAULT}
								className="w-full flex justify-center items-center"
							/>
						)}
						{isLoading && <Spin className="" />}
						{!isLoading && !_.isEmpty(customer_groups) && (
							<Form.Item
								labelCol={{ span: 24 }}
								name={['customer_groups', 'ids']}
								className="mb-0 w-full"
							>
								<CheckboxGroup
									className="w-full"
									value={['cgrp_01HZEJ56CZWGPJKAGFNAY9B53Q']}
									onChange={onChange}
								>
									{customer_groups?.map((item: any) => (
										<Flex
											align="center"
											justify="space-between"
											className="p-4 w-full"
											key={item.id}
										>
											<Flex align="center" justify="flex-start" gap="middle">
												<Checkbox value={item.id} />
												<Text>{item?.name}</Text>
											</Flex>
											<Text>{item?.customers?.length || 0}</Text>
										</Flex>
									))}
								</CheckboxGroup>
							</Form.Item>
						)}
					</Flex>
					<Flex className="w-full p-4" justify="flex-end" align="center">
						<Pagination
							current={currentPage}
							total={Math.floor(count ?? 0 / (PAGE_SIZE ?? 0))}
							pageSize={PAGE_SIZE}
							onChange={setCurrentPage}
							showTotal={(total: number, range: number[]) =>
								`${range[0]}-${range[1]} trong ${total} nhóm`
							}
						/>
					</Flex>
				</Col>
			)}
		</Row>
	);
};

export default PriceListCustomerGroups;
