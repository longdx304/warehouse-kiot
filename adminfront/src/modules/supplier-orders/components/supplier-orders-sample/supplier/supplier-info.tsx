import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import DatePicker from '@/components/Input/DatePicker';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { SUPPLIER_LIST } from '@/lib/hooks/api/supplier';
import { DateField } from '@/modules/supplier-orders/hooks/use-supplier-time';
import { Supplier } from '@/types/supplier';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useState } from 'react';
import { queryClient } from '@/lib/constants/query-client';

type SupplierInfoProps = {
	suppliers: Supplier[];
	selectedSupplier: Supplier | null;
	setSelectedSupplier: (supplier: Supplier | null) => void;
	supplierDates: {
		settlementDate: Dayjs | null;
		productionDate: Dayjs | null;
		completePaymentDate: Dayjs | null;
		warehouseEntryDate: Dayjs | null;
		shippingDate: Dayjs | null;
	};
	handleDateChange: (field: DateField) => (date: Dayjs | null) => void;
	updateDatesFromSupplier: (supplier: Supplier | null) => void;
};

const SupplierInfo: FC<SupplierInfoProps> = ({
	suppliers,
	selectedSupplier,
	setSelectedSupplier,
	supplierDates,
	handleDateChange,
	updateDatesFromSupplier,
}) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);

	const openModal = () => {
		setSelectedRowKeys([]);
		setIsModalVisible(true);
		setSelectedSupplier(null);
		updateDatesFromSupplier(null);
		queryClient.invalidateQueries([SUPPLIER_LIST, 'list']);
	};

	const columns: ColumnsType<Supplier> = [
		{
			title: 'Tên nhà cung cấp',
			dataIndex: 'supplier_name',
			key: 'supplier_name',
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'phone',
			key: 'phone',
		},
	];

	const handleRowSelectionChange = (selectedRowKeys: React.Key[]) => {
		// select rowkey = select supplier id
		setSelectedRowKeys(selectedRowKeys);
		const selected = suppliers.find(
			(supplier) => supplier.id === selectedRowKeys[0]
		) as Supplier;
		setSelectedSupplier(selected);
		setIsModalVisible(false);
	};

	return (
		<>
			{/* If no supplier is selected, show the button to select one */}
			{!selectedSupplier ? (
				<Button onClick={openModal}>Chọn nhà cung cấp</Button>
			) : (
				<Card>
					<p>
						<strong>Tên nhà cung cấp:</strong> {selectedSupplier.supplier_name}
					</p>
					<p>
						<strong>Email:</strong> {selectedSupplier.email}
					</p>
					<p>
						<strong>Số điện thoại:</strong> {selectedSupplier.phone}
					</p>
					<p>
						<strong>Địa chi:</strong> {selectedSupplier.address}
					</p>
					<p>
						<strong>Số ngày sản xuất dự kiến:</strong>{' '}
						<DatePicker
							format="DD-MM-YYYY"
							minDate={dayjs()}
							defaultValue={supplierDates.productionDate}
							placeholder="Chọn ngày bắt đầu"
							className="w-[180px]"
							onChange={handleDateChange('productionDate')}
						/>
					</p>
					<p>
						<strong>Số ngày thanh toán dự kiến:</strong>{' '}
						<DatePicker
							format="DD-MM-YYYY"
							minDate={dayjs()}
							defaultValue={supplierDates.settlementDate}
							placeholder="Chọn ngày bắt đầu"
							className="w-[180px]"
							onChange={handleDateChange('settlementDate')}
						/>
					</p>
					{/* Option to change supplier */}
					<Button onClick={openModal}>Đổi nhà cung cấp</Button>
				</Card>
			)}

			{/* Modal for selecting a supplier */}
			<Modal
				open={isModalVisible}
				handleCancel={() => setIsModalVisible(false)}
				handleOk={() => {}}
				title="Chọn nhà cung cấp"
			>
				{/* List of suppliers */}
				<Table
					rowKey="id"
					dataSource={suppliers}
					columns={columns as any}
					pagination={{ pageSize: 5 }}
					rowSelection={{
						type: 'radio',
						selectedRowKeys: selectedRowKeys,
						onChange: handleRowSelectionChange,
						preserveSelectedRowKeys: true,
					}}
				/>
			</Modal>
		</>
	);
};

export default SupplierInfo;
