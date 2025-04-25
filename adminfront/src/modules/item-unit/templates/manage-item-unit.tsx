'use client';
import { FloatButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Table } from '@/components/Table';
import { Title } from '@/components/Typography';
import { useAdminDeleteItemUnit } from '@/lib/hooks/api/item-unit';
import { useAdminItemUnits } from '@/lib/hooks/api/item-unit/queries';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { ItemUnit } from '@/types/item-unit';
import { Modal as AntdModal, message } from 'antd';
import { Plus } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import ItemUnitModal from '../components/item-unit-modal';
import itemUnitColumns from './item-unit.column';

type Props = {};

const ManageItemUnit: FC<Props> = () => {
	const {
		state: stateActionItemUnit,
		onOpen: onOpenActionItemUnit,
		onClose: onCloseActionItemUnit,
	} = useToggleState(false);

	const { item_units, isLoading, isRefetching, refetch } = useAdminItemUnits();
	const [itemUnitId, setItemUnitId] = useState<string | null>(null);
	const [isDeleteItemUnit, setDeleteItemUnit] = useState<boolean>(false);
	const deleteItemUnit = useAdminDeleteItemUnit(itemUnitId!);
	const [selectedItemUnit, setSelectedItemUnit] = useState<ItemUnit | null>(
		null
	);

	const handleEditItemUnit = (recordId: ItemUnit) => {
		setSelectedItemUnit(recordId);
		onOpenActionItemUnit();
	};

	const handleAddItemUnit = () => {
		setSelectedItemUnit(null);
		onOpenActionItemUnit();
	};

	const handleDeleteItemUnit = (id: ItemUnit['id']) => {
		setDeleteItemUnit(true);
		setItemUnitId(id);
		AntdModal.confirm({
			title: 'Xác nhận xóa đơn vị hàng này',
			content: 'Bạn có chắc chắn muốn xóa đơn vị hàng này?',
			onOk: async () => {
				await deleteItemUnit.mutateAsync(void 0, {
					onSuccess: () => {
						message.success('Xóa đơn vị hàng thành công');
						refetch();
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			},
		});
		setDeleteItemUnit(false);
	};

	const handleCloseModal = () => {
		setSelectedItemUnit(null);
		onCloseActionItemUnit();
	};

	const columns = useMemo(() => {
		return itemUnitColumns({
			handleEditItemUnit,
			handleDeleteItemUnit,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Card className="w-full" bordered={false}>
			<Flex align="center" justify="flex-start" className="mb-4">
				<Title level={3}>Đơn vị hàng</Title>
			</Flex>
			<Table
				loading={isLoading || isRefetching}
				columns={columns as any}
				dataSource={item_units}
				rowKey="code"
				scroll={{ x: 700 }}
				pagination={false}
			/>

			<FloatButton
				className="absolute bottom-1"
				icon={<Plus color="white" size={20} strokeWidth={2} />}
				type="primary"
				onClick={handleAddItemUnit}
				data-testid="btnCreateAccount"
			/>

			<ItemUnitModal
				open={stateActionItemUnit}
				onClose={handleCloseModal}
				selectedItemUnit={selectedItemUnit}
				onSuccess={refetch}
			/>
		</Card>
	);
};

export default ManageItemUnit;
