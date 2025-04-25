import {
	ConditionSelectorProps,
	DiscountConditionOperator,
} from '@/types/discount';
import { useAdminCustomerGroups } from 'medusa-react';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import SelectableTable from '@/components/Table/selectable-table';
import { CustomerGroup } from '@medusajs/medusa';
import _ from 'lodash';
import { defaultQueryProps } from '../../../discount-form/condition-tables/shared/common';
import { useConditions } from '../conditions-provider';
import { CustomerGroupColumns } from '../../../discount-form/condition-tables/shared/columns';
import ConditionOperator from '../../../discount-form/condition-tables/shared/condition-operator';
import DetailsConditionFooter from './details-condition-footer';

const DEFAULT_PAGE_SIZE = 10;
const DetailsCustomerGroupConditionSelector = ({
	isEdit = false,
	onClose = () => {},
}: ConditionSelectorProps) => {
	const params = defaultQueryProps;
	const { conditions } = useConditions();
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);

	const [operator, setOperator] = useState<DiscountConditionOperator>(
		conditions.customer_groups.operator
	);

	const { isLoading, count, customer_groups } = useAdminCustomerGroups(
		{ ...params, offset, q: searchValue, limit: DEFAULT_PAGE_SIZE },
		{
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (isEdit) {
			setSelectedRowKeys(conditions.customer_groups.items);
			setOperator(conditions.customer_groups.operator);
		}
	}, [conditions.customer_groups, isEdit]);

	const columns = CustomerGroupColumns;

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleSearchDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleRowSelectionChange = (selectedRowKeys: string[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	return (
		<Fragment>
			<ConditionOperator value={operator} onChange={setOperator} />
			<SelectableTable
				data={customer_groups as CustomerGroup[]}
				selectedRowKeys={selectedRowKeys}
				handleSearchDebounce={handleSearchDebounce}
				handleRowSelectionChange={handleRowSelectionChange}
				count={count}
				currentPage={currentPage}
				handleChangePage={handleChangePage}
				loadingTable={isLoading}
				columns={columns}
			/>
			<DetailsConditionFooter
				type="customer_groups"
				isEdit={isEdit}
				items={selectedRowKeys as string[]}
				operator={operator}
				onClose={onClose}
			/>
		</Fragment>
	);
};

export default DetailsCustomerGroupConditionSelector;
