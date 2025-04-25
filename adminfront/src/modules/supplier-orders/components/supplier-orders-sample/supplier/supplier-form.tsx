import { Collapse } from '@/components/Collapse';
import { Flex } from '@/components/Flex';
import { DateField } from '@/modules/supplier-orders/hooks/use-supplier-time';
import { Supplier } from '@/types/supplier';
import { CollapseProps } from 'antd';
import { Dayjs } from 'dayjs';
import { Minus, Plus } from 'lucide-react';
import { FC } from 'react';
import General from './general';
import SupplierInfo from './supplier-info';

type SupplierFormProps = {
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
	setIsSendEmail: (value: boolean) => void;
};

const SupplierForm: FC<SupplierFormProps> = ({
	suppliers,
	selectedSupplier,
	setSelectedSupplier,
	supplierDates,
	handleDateChange,
	updateDatesFromSupplier,
	setIsSendEmail,
}) => {
	const itemsCollapse: CollapseProps['items'] = [
		{
			key: 'info',
			label: (
				<Flex>
					<div className="mr-1">{'Thống tin nhà cung cấp'}</div>
				</Flex>
			),
			children: (
				<SupplierInfo
					suppliers={suppliers}
					selectedSupplier={selectedSupplier}
					setSelectedSupplier={setSelectedSupplier}
					supplierDates={supplierDates}
					handleDateChange={handleDateChange}
					updateDatesFromSupplier={updateDatesFromSupplier}
				/>
			),
		},
		{
			key: 'general',
			label: (
				<Flex>
					<div className="mr-1">{'Thông tin cơ bản'}</div>
				</Flex>
			),
			children: <General setIsSendEmail={setIsSendEmail} />,
		},
	];

	return (
		<Collapse
			className="bg-white [&_.ant-collapse-header]:px-0 [&_.ant-collapse-header]:text-base [&_.ant-collapse-header]:font-medium"
			defaultActiveKey={['info', 'general']}
			items={itemsCollapse}
			expandIconPosition="end"
			bordered={false}
			expandIcon={ExpandIcon as any}
		/>
	);
};

export default SupplierForm;

const ExpandIcon = ({ isActive }: { isActive: boolean }) =>
	isActive ? <Minus size={20} /> : <Plus size={20} />;
