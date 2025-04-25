'use client';
import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Plus } from 'lucide-react';
import { FC } from 'react';
import ModalAddWarehouse from '../components/modal-add-warehouse';
import { TabsProps } from 'antd';
import ProductManage from './product-manage';
import LocationManage from './location-manage';
import { Tabs } from '@/components/Tabs';

type Props = {};

const WarehouseManage: FC<Props> = ({}) => {
	const {
		state: stateWarehouse,
		onOpen: openWarehouse,
		onClose: closeWarehouse,
	} = useToggleState(false);

	const itemTabs: TabsProps['items'] = [
		{
			key: 'products',
			label: 'Sản phẩm',
			children: <ProductManage />,
		},
		{
			key: 'locaitons',
			label: 'Vị trí',
			children: <LocationManage />,
		},
	];

	return (
		<Flex vertical gap={12}>
			<Flex vertical align="flex-start" className="">
				<Title level={3}>Danh sách vị trí kho</Title>
				<Text className="text-gray-600">
					Trang danh sách các sản phẩm ở từng vị trí kho.
				</Text>
			</Flex>
			<Card loading={false} className="w-full" bordered={false}>
				<Tabs items={itemTabs} centered />
				<FloatButton
					icon={<Plus color="white" size={20} strokeWidth={2} />}
					type="primary"
					onClick={openWarehouse}
				/>
				{stateWarehouse && (
					<ModalAddWarehouse
						isModalOpen={stateWarehouse}
						onClose={closeWarehouse}
					/>
				)}
			</Card>
		</Flex>
	);
};

export default WarehouseManage;
