import {
	ConditionSelectorProps,
	DiscountConditionOperator,
} from '@/types/discount';
import { useAdminCollections } from 'medusa-react';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import SelectableTable from '@/components/Table/selectable-table';
import { ProductCollection } from '@medusajs/medusa';
import _ from 'lodash';
import { defaultQueryProps } from '../../../discount-form/condition-tables/shared/common';
import { useConditions } from '../conditions-provider';
import { CollectionColumns } from '../../../discount-form/condition-tables/shared/columns';
import ConditionOperator from '../../../discount-form/condition-tables/shared/condition-operator';
import DetailsConditionFooter from './details-condition-footer';

const DEFAULT_PAGE_SIZE = 10;
const DetailsCollectionConditionSelector = ({
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

	const handleRowSelectionChange = (selectedRowKeys: string[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	return (
		<Fragment>
			<ConditionOperator value={operator} onChange={setOperator} />
			<SelectableTable
				data={collections as ProductCollection[]}
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
				type="product_collections"
				isEdit={isEdit}
				items={selectedRowKeys as string[]}
				operator={operator}
				onClose={onClose}
			/>
		</Fragment>
	);
};

export default DetailsCollectionConditionSelector;
