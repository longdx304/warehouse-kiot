import React from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import {
	useAdminCreateItemUnit,
	useAdminUpdateItemUnit,
} from '@/lib/hooks/api/item-unit';
import { ItemUnit } from '@/types/item-unit';
import { getErrorMessage } from '@/lib/utils';

interface ItemUnitModalProps {
	open: boolean;
	onClose: () => void;
	selectedItemUnit?: ItemUnit | null;
	onSuccess: () => void;
}

type FormValues = {
	unit: string;
	quantity: number;
};

const ItemUnitModal = ({
	open,
	onClose,
	selectedItemUnit,
	onSuccess,
}: ItemUnitModalProps) => {
	const [form] = Form.useForm();
	const isEditing = !!selectedItemUnit;

	const createItemUnit = useAdminCreateItemUnit();
	const updateItemUnit = useAdminUpdateItemUnit(selectedItemUnit?.id!);

	const handleSubmit = async (values: FormValues) => {
		try {
			if (isEditing) {
				await updateItemUnit.mutateAsync(values, {
					onSuccess: () => {
						message.success('Cập nhật đơn vị hàng thành công');
						onSuccess();
						handleClose();
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			} else {
				await createItemUnit.mutateAsync(values, {
					onSuccess: () => {
						message.success('Tạo đơn vị hàng thành công');
						onSuccess();
						handleClose();
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			}
		} catch (error) {
			message.error(getErrorMessage(error));
		}
	};

	const handleClose = () => {
		form.resetFields();
		onClose();
	};

	React.useEffect(() => {
		if (selectedItemUnit && open) {
			form.setFieldsValue({
				unit: selectedItemUnit.unit,
				quantity: selectedItemUnit.quantity,
			});
		}
	}, [selectedItemUnit, open, form]);

	return (
		<Modal
			title={isEditing ? 'Cập nhật đơn vị hàng' : 'Tạo đơn vị hàng'}
			open={open}
			onCancel={handleClose}
			onOk={form.submit}
			confirmLoading={createItemUnit.isLoading || updateItemUnit.isLoading}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				initialValues={{ unit: '', quantity: 1 }}
			>
				<Form.Item
					label="Tên đơn vị"
					name="unit"
					rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
				>
					<Input placeholder="Nhập tên đơn vị" />
				</Form.Item>

				<Form.Item
					label="Số lượng"
					name="quantity"
					rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
				>
					<InputNumber
						className="w-full"
						min={1}
						placeholder="Nhập số lượng"
						disabled={selectedItemUnit?.quantity === 1}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ItemUnitModal;
