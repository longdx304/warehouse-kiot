import { Input } from '@/components/Input';
import DatePicker from '@/components/Input/DatePicker';
import { Modal } from '@/components/Modal';
import { Tooltip } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { queryClient } from '@/lib/constants/query-client';
import {
	supplierOrdersKeys,
	useAdminUpdateSupplierOrder,
} from '@/lib/hooks/api/supplier-order';
import { SupplierOrder } from '@/types/supplier';
import dayjs from 'dayjs';
import React, { useState } from 'react';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	supplierOrder: SupplierOrder;
};
const InformationModal: React.FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	supplierOrder,
}) => {
	const updateSupplierOrder = useAdminUpdateSupplierOrder(
		supplierOrder?.id || ''
	);

	const [formData, setFormData] = useState({
		displayName: supplierOrder?.display_name || '',
		estimatedProductionTime: supplierOrder?.estimated_production_time
			? dayjs(supplierOrder.estimated_production_time).format('YYYY-MM-DD')
			: '',
		settlementTime: supplierOrder?.settlement_time
			? dayjs(supplierOrder.settlement_time).format('YYYY-MM-DD')
			: '',
		shippingStartedDate: supplierOrder?.shipping_started_date ? 
			dayjs(supplierOrder.shipping_started_date).format('YYYY-MM-DD') :
			'',
		warehouseEntryDate: supplierOrder?.warehouse_entry_date ?
			dayjs(supplierOrder.warehouse_entry_date).format('YYYY-MM-DD') :
			'',
		completedPaymentDate: supplierOrder?.completed_payment_date ?
			dayjs(supplierOrder.completed_payment_date).format('YYYY-MM-DD') :
			'',
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleUpdateSupplierOrder = async () => {
		try {
			await updateSupplierOrder.mutateAsync({
				display_name: formData.displayName,
				estimated_production_time: dayjs(
					formData.estimatedProductionTime
				).toISOString(),
				settlement_time: dayjs(formData.settlementTime).toISOString(),
				shipping_started_date: dayjs(
					formData.shippingStartedDate
				).toISOString(),
				warehouse_entry_date: dayjs(
					formData.warehouseEntryDate
				).toISOString(),
				completed_payment_date: dayjs(
					formData.completedPaymentDate
				).toISOString(),
			});

			queryClient.invalidateQueries([supplierOrdersKeys, 'detail']);
			handleOk();
		} catch (error) {
			console.error('Error updating supplier order:', error);
		}
	};

	return (
		<Modal
			title="Chỉnh sửa thông tin"
			open={state}
			loading={updateSupplierOrder.isLoading}
			handleOk={handleUpdateSupplierOrder}
			handleCancel={handleCancel}
		>
			<div className="flex flex-col gap-2">
				<Text className="font-medium">Đơn hàng:</Text>
				<Input
					placeholder='Nhập tên đơn hàng (VD: "No.ADDA123")'
					value={formData.displayName}
					onChange={(e) => handleInputChange('displayName', e.target.value)}
				/>

				<Text className="font-medium">Ngày hoàn thành dự kiến:</Text>
				<DatePicker
					format="DD-MM-YYYY"
					minDate={dayjs()}
					value={dayjs(formData.estimatedProductionTime)}
					placeholder="Chọn ngày hoàn thành dự kiến"
					onChange={(date) =>
						handleInputChange(
							'estimatedProductionTime',
							date?.format('YYYY-MM-DD') || ''
						)
					}
				/>

				<Text className="font-medium">Ngày thanh toán dự kiến:</Text>
				<DatePicker
					format="DD-MM-YYYY"
					minDate={dayjs()}
					value={dayjs(formData.settlementTime)}
					placeholder="Chọn ngày thanh toán dự kiến"
					onChange={(date) =>
						handleInputChange(
							'settlementTime',
							date?.format('YYYY-MM-DD') || ''
						)
					}
				/>

				<Tooltip title={'Ngày tàu chạy'} className="font-medium">
					<Text className="font-medium">Ngày bắt đầu chuyển hàng:</Text>
				</Tooltip>
				<DatePicker
					format="DD-MM-YYYY"
					minDate={dayjs()}
					value={dayjs(formData.shippingStartedDate)}
					placeholder="Chọn ngày bắt đầu chuyển hàng"
					onChange={(date) =>
						handleInputChange(
							'shippingStartedDate',
							date?.format('YYYY-MM-DD') || ''
						)
					}
				/>

				<Text className="font-medium">Ngày nhập hàng vào kho:</Text>
				<DatePicker
					format="DD-MM-YYYY"
					minDate={dayjs()}
					value={dayjs(formData.warehouseEntryDate)}
					placeholder="Chọn ngày nhập hàng vào kho"
					onChange={(date) =>
						handleInputChange(
							'warehouseEntryDate',
							date?.format('YYYY-MM-DD') || ''
						)
					}
				/>

				<Text className="font-medium">Ngày tất toán đơn hàng:</Text>
				<DatePicker
					format="DD-MM-YYYY"
					minDate={dayjs()}
					value={dayjs(formData.completedPaymentDate)}
					placeholder="Chọn ngày tất toán đơn hàng"
					onChange={(date) =>
						handleInputChange(
							'completedPaymentDate',
							date?.format('YYYY-MM-DD') || ''
						)
					}
				/>
			</div>
		</Modal>
	);
};

export default InformationModal;
