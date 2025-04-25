import {
	ConditionSelectorProps,
	DiscountConditionOperator,
} from '@/types/discount';
import { defaultQueryProps } from '../shared/common';
import { useDiscountForm } from '../../discount-form-context';
import { useAdminProductTags } from 'medusa-react';
import ConditionOperator from '../shared/condition-operator';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import SelectableTable from '@/components/Table/selectable-table';
import { ProductTag } from '@medusajs/medusa';
import { TagColumns } from '../shared/columns';
import _ from 'lodash';
import AddConditionFooter from './add-condition-footer';

const DEFAULT_PAGE_SIZE = 10;
const TagConditionSelector = ({ isEdit = false }: ConditionSelectorProps) => {
	const params = defaultQueryProps;
	const { conditions } = useDiscountForm();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);

	const [operator, setOperator] = useState<DiscountConditionOperator>(
		conditions.product_tags.operator
	);

	const { isLoading, count, product_tags } = useAdminProductTags(
		{ ...params, offset, q: searchValue, limit: DEFAULT_PAGE_SIZE },
		{
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (isEdit) {
			setSelectedRowKeys(conditions.product_tags.items);
			setOperator(conditions.product_tags.operator);
		}
	}, [conditions.product_tags, isEdit]);

	const columns = TagColumns;

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

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	return (
		<Fragment>
			<ConditionOperator value={operator} onChange={setOperator} />
			<SelectableTable
				data={product_tags as ProductTag[]}
				selectedRowKeys={selectedRowKeys as string[]}
				handleSearchDebounce={handleSearchDebounce}
				handleRowSelectionChange={handleRowSelectionChange}
				count={count}
				currentPage={currentPage}
				handleChangePage={handleChangePage}
				loadingTable={isLoading}
				columns={columns}
			/>
			<AddConditionFooter
				type="product_tags"
				isEdit={isEdit}
				items={selectedRowKeys as string[]}
				operator={operator}
			/>
		</Fragment>
	);
};

export default TagConditionSelector;
