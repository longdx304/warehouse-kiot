import { ChangeEvent, useState } from 'react';
import { defaultQueryProps } from '../../../../../discount-form/condition-tables/shared/common';
import { useEditConditionContext } from '../../edit-condition-provider';
import { useAdminProductTags } from 'medusa-react';
import { ProductColumns } from '../../../../../discount-form/condition-tables/shared/columns';
import SelectableTable from '@/components/Table/selectable-table';
import { ProductTag } from '@medusajs/medusa';
import debounce from 'lodash/debounce';
import ConditionTableFooter from '../condition-table-footer';

const DEFAULT_PAGE_SIZE = 10;
const AddProductTags = () => {
	const params = defaultQueryProps;

	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchValue, setSearchValue] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);

	const { saveAndClose, saveAndGoBack } = useEditConditionContext();

	const {
		isLoading: isLoadingProducts,
		count,
		product_tags,
	} = useAdminProductTags(
		{
			...params,
			offset,
			q: searchValue,
			limit: DEFAULT_PAGE_SIZE,
		},
		{
			keepPreviousData: true,
		}
	);

	const columns = ProductColumns;

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

	const handleSaveAndGoBack = () => {
		saveAndGoBack(selectedRowKeys);
	};

	const handleSaveAndClose = () => {
		saveAndClose(selectedRowKeys);
	};

	return (
		<div>
			<SelectableTable
				count={count ?? 0}
				selectedRowKeys={selectedRowKeys}
				data={(product_tags as ProductTag[]) || []}
				columns={columns}
				loadingTable={isLoadingProducts}
				currentPage={currentPage}
				handleChangePage={handleChangePage}
				handleSearchDebounce={handleSearchDebounce}
				handleRowSelectionChange={handleRowSelectionChange}
			/>
			<ConditionTableFooter
				saveAndGoBack={handleSaveAndGoBack}
				saveAndClose={handleSaveAndClose}
			/>
		</div>
	);
};

export default AddProductTags;
