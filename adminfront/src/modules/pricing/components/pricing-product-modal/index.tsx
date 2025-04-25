import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import {
	CircleAlert,
	CircleDollarSign,
	PackagePlus,
	Search,
} from 'lucide-react';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import _ from 'lodash';
import { useAdminPriceListProducts, useMedusa } from 'medusa-react';
import { Table } from '@/components/Table';
import productsColumns from './products-column';
import { Product } from '@medusajs/medusa';
import { ActionAbles } from '@/components/Dropdown';
import useToggleState from '@/lib/hooks/use-toggle-state';
import ProductModal from './product-modal';
import EditPricesModal from './edit-prices-modal';
import { Modal as AntdModal, message } from 'antd';
import { getErrorMessage } from '@/lib/utils';
import EditPriceModal from './edit-price-modal';

type Props = {
	id: string;
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const PAGE_SIZE = 10;
const PriceProductModal: FC<Props> = ({
	id,
	state,
	handleOk,
	handleCancel,
}) => {
	const { client } = useMedusa();
	const [searchValue, setSearchValue] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

	const {
		state: stateProduct,
		onOpen: onOpenProduct,
		onClose: onCloseProduct,
	} = useToggleState(false);
	const {
		state: stateEditPrices,
		onOpen: onOpenEditPrices,
		onClose: onCloseEditPrices,
	} = useToggleState(false);
	const {
		state: stateEditPrice,
		onOpen: onOpenEditPrice,
		onClose: onCloseEditPrice,
	} = useToggleState(false);

	const { products, isLoading, count, refetch, isRefetching } =
		useAdminPriceListProducts(
			id,
			{
				limit: PAGE_SIZE,
				offset: (currentPage - 1) * PAGE_SIZE,
				q: searchValue || undefined,
				expand: 'variants,collection',
			},
			{
				keepPreviousData: true,
			}
		);

	const { products: allProducts } = useAdminPriceListProducts(
		id,
		{
			limit: count,
			fields: 'id',
		},
		{
			enabled: !!count,
		}
	);

	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			setSearchValue(inputValue);
		},
		500
	);

	const handleChangePage = (page: number) => {
		setCurrentPage(page);
	};

	const handleEditPricing = (record: Product) => {
		setCurrentProduct(record);
		onOpenEditPrice();
	};

	const handleDeletePricing = (productId: Product['id']) => {
		AntdModal.confirm({
			title: 'Bạn chắc chắn muốn xoá ?',
			content:
				'Sản phẩm sẽ được xoá khỏi danh giá. Bạn có muốn tiếp tục không ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				await client.admin.priceLists
					.deleteProductPrices(id, productId)
					.then(() => {
						message.success('Xoá sản phẩm khỏi danh sách giá thành công');
						refetch();
					})
					.catch((error: any) => {
						message.error(getErrorMessage(error));
					});
				return;
			},
			onCancel() {
				return false;
			},
		});
	};

	const actions = [
		{
			label: 'Chỉnh sửa tất cả giá',
			icon: <CircleDollarSign size={20} />,
			onClick: () => {
				onOpenEditPrices();
			},
		},
		{
			label: 'Thêm sản phẩm',
			icon: <PackagePlus size={20} />,
			onClick: () => {
				onOpenProduct();
			},
		},
	];

	const columns = useMemo(
		() => productsColumns({ handleEditPricing, handleDeletePricing }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[products]
	);

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			handleCancel={handleCancel}
			width={800}
		>
			<div id="action-product">
				<Title level={3}>Danh sách sản phẩm</Title>
				<Flex
					align="center"
					justify="flex-end"
					gap="middle"
					className="p-4 border-0 border-b border-solid border-gray-200"
				>
					<Input
						placeholder="Nhập tên sản phẩm"
						className="w-[250px] text-xs"
						size="small"
						prefix={<Search size={16} />}
						onChange={handleChangeDebounce}
					/>
					<ActionAbles actions={actions as any} />
				</Flex>
			</div>
			<div id="table-product">
				<Table
					columns={columns as any}
					dataSource={products ?? []}
					loading={isLoading || isRefetching}
					rowKey="id"
					scroll={{ x: 700 }}
					pagination={{
						total: Math.floor(count ?? 0 / (PAGE_SIZE ?? 0)),
						pageSize: PAGE_SIZE,
						current: currentPage || 1,
						onChange: handleChangePage,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} trong ${total} sản phẩm`,
					}}
				/>
			</div>

			<ProductModal
				state={stateProduct}
				handleOk={onCloseProduct}
				handleCancel={onCloseProduct}
				productIds={allProducts?.map((p) => p.id as string) || []}
				priceListId={id}
			/>
			{/* Chỉnh sửa giá tiền tất cả sản phẩm */}
			{stateEditPrices && (
				<EditPricesModal
					state={stateEditPrices}
					handleOk={onCloseEditPrices}
					handleCancel={onCloseEditPrices}
					priceListId={id}
					productIds={products?.map((p) => p.id as string) || []}
				/>
			)}
			{/* Chỉnh sửa giá tiền từng sản phẩm */}
			{stateEditPrice && currentProduct && (
				<EditPriceModal
					state={stateEditPrice}
					handleOk={onCloseEditPrice}
					handleCancel={onCloseEditPrice}
					priceListId={id}
					productId={currentProduct.id}
				/>
			)}
		</Modal>
	);
};

export default PriceProductModal;
