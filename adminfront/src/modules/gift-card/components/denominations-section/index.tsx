import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Product, ProductVariant } from '@medusajs/medusa';
import { Col, Row } from 'antd';
import { Plus } from 'lucide-react';
import { useAdminStore } from 'medusa-react';
import { useMemo, useState } from 'react';
import denominationColumns from './columns';
import { Table } from '@/components/Table';
import ModalDenomination from './modal-denominations';

type Props = {
	giftCard: Product;
	loading: boolean;
};

const DenominationsSection = ({ giftCard, loading }: Props) => {
	const [denomination, setDenomination] = useState<ProductVariant | null>(null);
	const {
		state: addDenomination,
		onClose: closeAddDenomination,
		onOpen: openAddDenomination,
	} = useToggleState();

	const actions = [
		{
			label: <span className="w-full">Thêm mệnh giá</span>,
			key: 'add-denomination',
			icon: <Plus size={20} />,
			onClick: openAddDenomination,
		},
	];

	const { store } = useAdminStore();

	// const handleDeleteVariant = (variantId: ProductVariant['id']) => {
	// 	Modal.confirm({
	// 		title: 'Bạn có muốn xoá biến thể này không ?',
	// 		content:
	// 			'Biến thể sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá biến thể này chứ?',
	// 		icon: (
	// 			<CircleAlert
	// 				style={{ width: 32, height: 24 }}
	// 				className="mr-2"
	// 				color="#E7B008"
	// 			/>
	// 		),
	// 		okType: 'danger',
	// 		okText: 'Đồng ý',
	// 		cancelText: 'Huỷ',
	// 		async onOk() {
	// 			try {
	// 				deleteVariant.mutate(variantId, {
	// 					onSuccess: () => {
	// 						messageApi.success('Xoá biến thể thành công!');
	// 					},
	// 				});
	// 			} catch (error) {
	// 				messageApi.error('Xoá biến thể thất bại!');
	// 			}
	// 		},
	// 		onCancel() {
	// 			console.log('Cancel');
	// 		},
	// 	});
	// };

	const handleEditVariant = (variant: ProductVariant) => {
		setDenomination(variant);
		openAddDenomination();
	};
	const handleDeleteVariant = (variantId: ProductVariant['id']) => {};

	const columns = useMemo(
		() => {
			if (!store) return [];
			return denominationColumns({
				handleEditVariant,
				handleDeleteVariant,
				store,
			});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[giftCard, store]
	);

	return (
		<Card
			// loading={loading || isLoadingCategory || isLoadingCollection}
			className="p-4"
		>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Flex align="center" justify="space-between">
						<Title level={3}>Mệnh giá</Title>
						<ActionAbles actions={actions} />
					</Flex>
				</Col>
				<Col span={24}>
					<Table
						scroll={{ x: 400 }}
						columns={columns as any}
						dataSource={giftCard?.variants ?? []}
						rowKey="id"
						pagination={false}
					/>
				</Col>
			</Row>
			{addDenomination && (
				<ModalDenomination
					open={addDenomination}
					onClose={closeAddDenomination}
					giftCard={giftCard}
					denomination={denomination}
				/>
			)}
		</Card>
	);
};

export default DenominationsSection;
