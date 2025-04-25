import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Supplier } from '@/types/supplier';

export type DateField =
	| 'settlementDate'
	| 'productionDate'
	| 'completePaymentDate'
	| 'warehouseEntryDate'
  | 'shippingDate';
type SupplierDates = Record<DateField, Dayjs | null>;

const INITIAL_DATES: SupplierDates = {
	settlementDate: null,
	productionDate: null,
	completePaymentDate: null,
	warehouseEntryDate: null,
  shippingDate: null
};

const SUPPLIER_DATE_MAPPINGS = {
	settlementDate: 'settlement_time',
	productionDate: 'estimated_production_time',
	completePaymentDate: 'completed_payment_date',
	warehouseEntryDate: 'warehouse_entry_date',
  shippingDate: 'shipping_started_date'
} as const;

const useSupplierTime = () => {
	const [supplierDates, setSupplierDates] =
		useState<SupplierDates>(INITIAL_DATES);

	const handleDateChange = (field: DateField) => (date: Dayjs | null) => {
		setSupplierDates((prev) => ({ ...prev, [field]: date }));
	};

	const updateDatesFromSupplier = (supplier: Supplier | null) => {
		if (!supplier) {
			setSupplierDates(INITIAL_DATES);
			return;
		}		

		const newDates = Object.entries(SUPPLIER_DATE_MAPPINGS).reduce(
			(acc, [dateField, supplierField]) => ({
				...acc,
				[dateField]: dayjs().add(supplier[supplierField], 'day'),
			}),
			{} as SupplierDates
		);

		const updateNewDates: SupplierDates = {
			...newDates,
			shippingDate: dayjs().add(1, 'day'),
		}
		setSupplierDates(updateNewDates);
	};

	return {
		supplierDates,
		setSupplierDates,
		handleDateChange,
		updateDatesFromSupplier,
	};
};

export default useSupplierTime;
