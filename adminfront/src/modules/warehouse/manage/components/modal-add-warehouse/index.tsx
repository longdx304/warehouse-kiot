import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Text } from '@/components/Typography';
import { useAdminCreateWarehouse } from '@/lib/hooks/api/warehouse';
import { getErrorMessage } from '@/lib/utils';
import { message } from 'antd';
import { FC, useState } from 'react';

interface Props {
	isModalOpen: boolean;
	onClose: () => void;
}

const ModalAddWarehouse: FC<Props> = ({ isModalOpen, onClose }) => {
	const [value, setValue] = useState<string>('');
	const addWarehouse = useAdminCreateWarehouse();

	const handleOkModal = async () => {
		if (!value) {
			return message.error('Vui lòng nhập tên vị trí kho');
		}
		addWarehouse.mutate(
			{ location: value },
			{
				onSuccess: () => {
					message.success(`Đã thêm vị trí kho thành công`);
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
		onClose();
	};

	return (
		<Modal
			open={isModalOpen}
			handleCancel={() => {
				onClose();
			}}
			handleOk={handleOkModal}
			title={'Thêm vị trí kho'}
			isLoading={addWarehouse.isLoading}
		>
			<Flex vertical align="flex-start">
				<Text className="text-[14px] text-gray-500">Tên vị trí:</Text>
				<Input
					className="w-full"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
			</Flex>
		</Modal>
	);
};

export default ModalAddWarehouse;
