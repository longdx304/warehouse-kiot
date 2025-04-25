'use client';
import { ItemUnit } from '@/types/item-unit';
import React, { PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useAdminItemUnits } from '../hooks/api/item-unit';

export enum ProductUnit {
	PRODUCT_CATEGORIES = 'product_categories',
	INVENTORY = 'inventoryService',
}

type ProductUnitContextType = {
	item_units: ItemUnit[];
	optionItemUnits?: { value: string; label: string }[];
	defaultUnit: string | null;
	selectedUnit: string | null;
	quantity: number;
	setSelectedUnit: (unitId: string) => void;
	setQuantity: (quantity: number) => void;
	getSelectedUnitData: () => {
		unitId: string;
		quantity: number;
		totalQuantity: number;
	} | null;
	onReset: () => void;
};

const defaultProductUnitContext: ProductUnitContextType = {
	item_units: [],
	optionItemUnits: [],
	defaultUnit: '',
	selectedUnit: null,
	quantity: 0,
	setSelectedUnit: () => {},
	setQuantity: () => {},
	getSelectedUnitData: () => null,
	onReset: () => {},
};

const ProductUnitContext = React.createContext(defaultProductUnitContext);

export const ProductUnitProvider = ({ children }: PropsWithChildren) => {
	const { item_units } = useAdminItemUnits();
	const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
	const [quantity, setQuantity] = useState<number>(0);

	const optionItemUnits = useMemo(() => {
		if (!item_units) return [];
		return (
			item_units
				// .filter((item) => item.id !== 'default')
				.map((item) => ({
					value: item.id,
					label: item.unit,
				}))
		);
	}, [item_units]);

	const defaultUnit =
		item_units?.find((item) => item.unit === 'bịch 6' || item.quantity === 6)
			?.id || '';

	const getSelectedUnitData = () => {
		const findUnit = item_units?.find((item) => item.id === selectedUnit);
		return {
			unitId: selectedUnit ?? defaultUnit,
			quantity: quantity,
			totalQuantity: quantity * (findUnit?.quantity ?? 1),
		};
	};

	const onReset = () => {
		setSelectedUnit(defaultUnit);
		setQuantity(1);
	};

	return (
		<ProductUnitContext.Provider
			value={{
				item_units: item_units ?? [],
				optionItemUnits,
				defaultUnit,
				selectedUnit,
				quantity,
				setSelectedUnit,
				setQuantity,
				getSelectedUnitData,
				onReset,
			}}
		>
			{children}
		</ProductUnitContext.Provider>
	);
};

export const useProductUnit = () => {
	const context = useContext(ProductUnitContext);

	if (!context) {
		throw new Error('useProductUnit must be used within a ProductUnitProvider');
	}

	return context;
};
