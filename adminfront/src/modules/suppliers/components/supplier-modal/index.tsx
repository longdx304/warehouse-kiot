import { Input, InputNumber } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import {
	useAdminCreateSupplier,
	useAdminUpdateSupplier,
} from '@/lib/hooks/api/supplier';
import { getErrorMessage } from '@/lib/utils';
import { Supplier } from '@/types/supplier';
import { Col, Form, Row, message } from 'antd';
import { FC, useEffect } from 'react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	supplier: Supplier;
};

type SupplierFormProps = {
	email: string;
	supplier_name: string;
	phone: string;
	address: string;
	estimated_production_time: number;
	settlement_time: number;
};

const SupplierModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	supplier,
}) => {
	const [form] = Form.useForm();
	const updateSupplier = useAdminUpdateSupplier(supplier?.id);
	const createSupplier = useAdminCreateSupplier();

	const isEditing = !!supplier;

	useEffect(() => {
		if (supplier) {
			form.setFieldsValue({
				email: supplier.email,
				supplier_name: supplier.supplier_name,
				phone: supplier.phone,
				address: supplier.address,
				estimated_production_time: supplier.estimated_production_time,
				settlement_time: supplier.settlement_time,
			});
		} else {
			form.resetFields();
		}
	}, [supplier, form]);

	const onFinish = async (values: SupplierFormProps) => {
		const operation = isEditing
			? updateSupplier.mutateAsync
			: createSupplier.mutateAsync;

		await operation(values, {
			onSuccess: () => {
				message.success(
					isEditing
						? 'Cập nhật thông tin nhà cung cấp thành công'
						: 'Tạo nhà cung cấp mới thành công'
				);
				handleOk();
			},
			onError: (error) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	return (
		<SubmitModal
			title={
				isEditing ? 'Chỉnh sửa thông tin nhà cung cấp' : 'Tạo nhà cung cấp mới'
			}
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={
				isEditing ? updateSupplier.isLoading : createSupplier.isLoading
			}
			form={form}
			maskClosable={false}
		>
			<Form form={form} onFinish={onFinish} layout="vertical">
				<Row gutter={[16, 8]} className="pt-4">
					<Col xs={24}>
						<Form.Item name="email" label="Email">
							<Input placeholder="Email nhà cung cấp" />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item
							name="supplier_name"
							label="Tên nhà cung cấp"
							rules={[
								{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
							]}
						>
							<Input placeholder="Tên nhà cung cấp" />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item
							name="phone"
							label="Số điện thoại"
							rules={[
								{ required: true, message: 'Vui lòng nhập số điện thoại' },
								{ min: 10, message: 'Số điện thoại ít nhất phải 10 chữ số' },
							]}
						>
							<Input placeholder="0987654321" />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item
							name="address"
							label="Địa chỉ"
							rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
						>
							<Input placeholder="Địa chỉ nhà cung cấp" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							name="estimated_production_time"
							label="Thời gian sản xuất ước tính (ngày)"
							rules={[
								{
									required: true,
									message: 'Vui lòng nhập thời gian sản xuất ước tính',
								},
								{ type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' },
							]}
						>
							<InputNumber placeholder="7" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							name="settlement_time"
							label="Thời gian thanh toán mặc định (ngày)"
							rules={[
								{
									required: true,
									message: 'Vui lòng nhập thời gian thanh toán mặc định',
								},
								{ type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' },
							]}
						>
							<InputNumber placeholder="7" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							name="completed_payment_date"
							label="Ngày cần quyết toán hoàn tất đơn hàng"
							rules={[
								{
									required: true,
									message: 'Vui lòng nhập ngày cần quyết toán hoàn tất đơn hàng',
								},
								{ type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' },
							]}
						>
							<InputNumber placeholder="5" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							name="warehouse_entry_date"
							label="Ngày nhập hàng vào kho (dự kiến)"
							rules={[
								{
									required: true,
									message: 'Vui lòng nhập ngày nhập hàng vào kho (dự kiến)',
								},
							]}
						>
							<InputNumber placeholder="5" />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default SupplierModal;
