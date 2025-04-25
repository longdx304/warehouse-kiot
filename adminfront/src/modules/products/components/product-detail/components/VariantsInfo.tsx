import { FC, useMemo, useState } from 'react';
// import { Product } from '@medusajs/client-types';
import { Row, Col, Empty, Modal, message, MenuProps } from 'antd';
import { Plus, CircleDollarSign, Settings, CircleAlert } from 'lucide-react';
import { useAdminDeleteVariant } from 'medusa-react';
import { Product } from '@medusajs/medusa';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Title, Text } from '@/components/Typography';
import { ActionAbles } from '@/components/Dropdown';
import { Tag } from '@/components/Tag';
import useToggleState from '@/lib/hooks/use-toggle-state';
import variantsColumns from './variantsColumns';
import { Table } from '@/components/Table';
import PricesModal from './edit-modals/prices-modal';
import OptionModal from './edit-modals/OptionModal';
import AddVariantModal from './edit-modals/variant-form/AddVariantModal';
import { ProductVariant } from '@/types/products';

type Props = {
	product: Product;
	loadingProduct: boolean;
};

const VariantsInfo: FC<Props> = ({ product, loadingProduct }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const deleteVariant = useAdminDeleteVariant(product?.id);

	const {
		state: statePrice,
		onOpen: onOpenPrice,
		onClose: onClosePrice,
	} = useToggleState(false);
	const {
		state: stateOption,
		onOpen: onOpenOption,
		onClose: onCloseOption,
	} = useToggleState(false);
	const {
		state: stateVariants,
		onOpen: onOpenVariants,
		onClose: onCloseVariants,
	} = useToggleState(false);

	const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);
	const [typeVariant, setTypeVariant] = useState<
		'CREATE' | 'UPDATE' | 'COPY' | null
	>(null);

	const handleCreateVariant = () => {
		setTypeVariant('CREATE');
		onOpenVariants();
	};
	const handleCloseVariant = () => {
		setTypeVariant(null);
		onCloseVariants();
	};
	const actions = [
		{
			label: <span className="w-full">Thêm biến thể</span>,
			key: 'add-variants',
			icon: <Plus size={20} />,
			onClick: handleCreateVariant,
		},
		{
			label: <span className="w-full">Chỉnh sửa giá</span>,
			key: 'edit-price',
			icon: <CircleDollarSign size={20} />,
			disabled: !product?.variants?.length,
			onClick: onOpenPrice,
		},
		{
			label: <span className="w-full">Chỉnh sửa tuỳ chọn</span>,
			key: 'edit-option',
			icon: <Settings size={20} />,
			onClick: onOpenOption,
		},
	];

	const handleEditVariant = (variant: ProductVariant) => {
		setTypeVariant('UPDATE');
		setEditVariant(variant);
		onOpenVariants();
	};
	const handleCopyVariant = (variant: ProductVariant) => {
		setTypeVariant('COPY');
		setEditVariant(variant);
		onOpenVariants();
	};

	const handleDeleteVariant = (variantId: ProductVariant['id']) => {
		Modal.confirm({
			title: 'Bạn có muốn xoá biến thể này không ?',
			content:
				'Biến thể sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá biến thể này chứ?',
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
				try {
					deleteVariant.mutate(variantId, {
						onSuccess: () => {
							messageApi.success('Xoá biến thể thành công!');
						},
					});
				} catch (error) {
					messageApi.error('Xoá biến thể thất bại!');
				}
			},
		});
	};

	const columns = useMemo(
		() =>
			variantsColumns({
				handleEditVariant,
				handleDeleteVariant,
				handleCopyVariant,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[product]
	);

	return (
		<Card loading={loadingProduct} className="p-4">
			{contextHolder}
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Flex align="center" justify="space-between">
						<Title level={3}>Variants</Title>
						<ActionAbles actions={actions} onMenuClick={() => {}} />
					</Flex>
				</Col>
				{product?.options?.length ? (
					<Col span={24}>
						<RenderOptions product={product} />
						<Flex vertical gap="small" className="pt-8">
							<Text className="text-sm font-semibold">{`Biến thể sản phẩm (${
								product?.variants?.length || 0
							})`}</Text>
							<Table
								scroll={{ x: 300 }}
								columns={columns as any}
								dataSource={product?.variants ?? []}
								rowKey="id"
								pagination={false}
							/>
						</Flex>
					</Col>
				) : (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="Không có biến thể"
					/>
				)}
			</Row>
			<PricesModal
				product={product}
				state={statePrice}
				handleOk={onClosePrice}
				handleCancel={onClosePrice}
			/>
			<OptionModal
				product={product}
				state={stateOption}
				handleOk={onCloseOption}
				handleCancel={onCloseOption}
			/>
			<AddVariantModal
				product={product}
				state={stateVariants}
				handleOk={onCloseVariants}
				handleCancel={handleCloseVariant}
				variant={editVariant!}
				typeVariant={typeVariant}
			/>
		</Card>
	);
};

export default VariantsInfo;

const RenderOptions = ({ product }: { product: Product }) => {
	return (
		<Flex gap="middle" wrap className="w-full pt-2 flex-wrap">
			{product?.options?.length &&
				product?.options.map((option: any) => (
					<Flex
						key={option.id}
						vertical
						align="center"
						justify="start"
						gap="small"
					>
						<Flex vertical gap="8px" className="w-full">
							<Text className="text-sm font-semibold">{option.title}</Text>
							<Flex align="center" className="flex-wrap">
								{option?.values
									?.map((value: any) => value.value)
									.filter(
										(v: any, index: any, self: string | any[]) =>
											self.indexOf(v) === index
									)
									.map((value: any) => (
										<Tag
											key={value}
											className="text-xs font-semibold w-fit px-3 py-[6px] bg-[#F3F4F6] text-[#6b7280] rounded-lg"
											bordered={false}
										>
											{value}
										</Tag>
									))}
							</Flex>
						</Flex>
					</Flex>
				))}
		</Flex>
	);
};
