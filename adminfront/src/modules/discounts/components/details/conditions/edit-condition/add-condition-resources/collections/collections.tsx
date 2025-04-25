import { ChangeEvent, useEffect, useState } from 'react';
import { defaultQueryProps } from '../../../../../discount-form/condition-tables/shared/common';
import { useEditConditionContext } from '../../edit-condition-provider';
import { useAdminCollections } from 'medusa-react';
import { CollectionColumns } from '../../../../../discount-form/condition-tables/shared/columns';
import SelectableTable from '@/components/Table/selectable-table';
import { ProductCollection } from '@medusajs/medusa';
import debounce from 'lodash/debounce';
import ExistingConditionTableActions from '../../condition-table-actions';

const DEFAULT_PAGE_SIZE = 10;
const CollectionConditionsTable = () => {
	const params = defaultQueryProps;

	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);

	const { condition, removeConditionResources, isLoading } =
		useEditConditionContext();

	const {
		isLoading: isLoadingProducts,
		count,
		collections,
		refetch,
	} = useAdminCollections(
		{
			discount_condition_id: condition.id,
			...params,
			offset,
			q: searchValue,
			limit: DEFAULT_PAGE_SIZE,
		},
		{
			keepPreviousData: true,
		}
	);

	const columns = CollectionColumns;

	const onDeselect = () => {
		setSelectedRowKeys([]);
	};

	const onRemove = () => {
		removeConditionResources(selectedRowKeys);
		onDeselect();
	};

	useEffect(() => {
		if (!isLoading) {
			refetch(); // if loading is flipped, we've either added or removed resources -> refetch
			onDeselect();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * DEFAULT_PAGE_SIZE);
	};

	const handleSearchDebounce = debounce((e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		setSearchValue(inputValue);
	}, 500);

	const handleRowSelectionChange = (selectedRowKeys: string[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};

	return (
		<div>
			<SelectableTable
				count={count ?? 0}
				selectedRowKeys={selectedRowKeys}
				data={(collections as ProductCollection[]) || []}
				columns={columns}
				loadingTable={isLoadingProducts}
				currentPage={currentPage}
				handleChangePage={handleChangePage}
				handleSearchDebounce={handleSearchDebounce}
				handleRowSelectionChange={handleRowSelectionChange}
				tableActions={
					<ExistingConditionTableActions
						numberOfSelectedRows={selectedRowKeys.length}
						onDeselect={onDeselect}
						onRemove={onRemove}
					/>
				}
			/>
		</div>
	);
};

export default CollectionConditionsTable;
