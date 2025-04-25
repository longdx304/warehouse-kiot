import {
	ConditionSelectorProps,
	DiscountConditionOperator,
} from '@/types/discount';
import { defaultQueryProps } from '../shared/common';
import { useDiscountForm } from '../../discount-form-context';
import { useAdminCollections } from 'medusa-react';
import ConditionOperator from '../shared/condition-operator';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import SelectableTable from '@/components/Table/selectable-table';
import { ProductCollection } from '@medusajs/medusa';
import { CollectionColumns } from '../shared/columns';
import _ from 'lodash';
import AddConditionFooter from './add-condition-footer';

const DEFAULT_PAGE_SIZE = 10;
const CollectionConditionSelector = ({
	isEdit = false,
}: ConditionSelectorProps) => {
	const params = defaultQueryProps;
	const { conditions } = useDiscountForm();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);

	const [operator, setOperator] = useState<DiscountConditionOperator>(
		conditions.product_collections.operator
	);

	const { isLoading, count, collections } = useAdminCollections(
		{ ...params, offset, q: searchValue, limit: DEFAULT_PAGE_SIZE },
		{
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		if (isEdit) {
			setSelectedRowKeys(conditions.product_collections.items);
			setOperator(conditions.product_collections.operator);
		}
	}, [conditions.product_collections, isEdit]);

	const columns = CollectionColumns;

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
				data={collections as ProductCollection[]}
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
				type="product_collections"
				isEdit={isEdit}
				items={selectedRowKeys as string[]}
				operator={operator}
			/>
		</Fragment>
	);
};

export default CollectionConditionSelector;
