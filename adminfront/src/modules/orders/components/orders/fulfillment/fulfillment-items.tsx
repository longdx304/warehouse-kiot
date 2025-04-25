import { InputNumber } from '@/components/Input';
import PlaceholderImage from '@/modules/common/components/placeholder-image';
import { LineItem } from '@medusajs/medusa';
import { useAdminVariantsInventory } from 'medusa-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo } from 'react';
import { getFulfillAbleQuantity } from './create-fulfillment-modal';

const FulfillmentItems = ({
	items,
	quantities,
	setQuantities,
	setErrors,
}: {
	items: LineItem[];
	quantities: Record<string, number>;
	setQuantities: (quantities: Record<string, number>) => void;
	locationId?: string;
	// setErrors: (errors: React.SetStateAction<{}>) => void;
	setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) => {
	const handleQuantityUpdate = useCallback(
		(value: number, id: string) => {
			let newQuantities = { ...quantities };

			newQuantities = {
				...newQuantities,
				[id]: value,
			};

			setQuantities(newQuantities);
		},
		[quantities, setQuantities]
	);

	return (
		<div className="mt-4">
			{items.map((item, idx) => {
				return (
					<FulfillmentLine
						item={item}
						// locationId={locationId}
						key={`fulfillmentLine-${idx}`}
						quantities={quantities}
						handleQuantityUpdate={handleQuantityUpdate}
						setErrors={setErrors}
					/>
				);
			})}
		</div>
	);
};

export default FulfillmentItems;

const FulfillmentLine = ({
	item,
	locationId,
	quantities,
	handleQuantityUpdate,
	setErrors,
}: {
	locationId?: string;
	item: LineItem;
	quantities: Record<string, number>;
	handleQuantityUpdate: (value: number, id: string) => void;
	// setErrors: (errors: Record<string, string>) => void;
	setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) => {
	const isLocationFulfillmentEnabled = false;
	const { variant, isLoading, refetch } = useAdminVariantsInventory(
		item.variant_id as string,
		{ enabled: isLocationFulfillmentEnabled }
	);

	const hasInventoryItem = !!variant?.inventory.length;

	const { availableQuantity, inStockQuantity } = useMemo(() => {
		if (!isLocationFulfillmentEnabled) {
			return {
				availableQuantity: item.variant.inventory_quantity,
				inStockQuantity: item.variant.inventory_quantity,
			};
		}

		if (isLoading || !locationId || !variant) {
			return {};
		}

		const { inventory } = variant;

		const locationInventory = inventory[0]?.location_levels?.find(
			(inv) => inv.location_id === locationId
		);

		if (!locationInventory) {
			return {};
		}

		return {
			availableQuantity: locationInventory.available_quantity,
			inStockQuantity: locationInventory.stocked_quantity,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isLoading,
		locationId,
		variant,
		item.variant,
		isLocationFulfillmentEnabled,
	]);

	const validQuantity =
		!locationId ||
		(locationId &&
			(!availableQuantity || quantities[item.id] <= availableQuantity));

	useEffect(() => {
		setErrors((errors: Record<string, string>) => {
			if (validQuantity) {
				delete errors[item.id];
				return errors;
			}

			errors[item.id] = 'Số lượng không hợp lệ';
			return errors;
		});
	}, [validQuantity, setErrors, item.id]);

	useEffect(() => {
		if (!availableQuantity && hasInventoryItem) {
			handleQuantityUpdate(0, item.id);
		} else {
			handleQuantityUpdate(
				Math.min(
					getFulfillAbleQuantity(item),
					...([
						hasInventoryItem ? (availableQuantity as number) : Number.MAX_VALUE,
					] as number[])
				),
				item.id
			);
		}
		// Note: we can't add handleQuantityUpdate to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableQuantity, item, item.id]);

	if (getFulfillAbleQuantity(item) <= 0) {
		return null;
	}

	return (
		<div className="hover:bg-gray-50 rounded-md mx-[-5px] mb-1 flex h-[64px] justify-between px-[5px] cursor-pointer">
			<div className="flex justify-center items-center space-x-4">
				<div className="rounded-sm flex h-[48px] w-[36px] overflow-hidden">
					{item.thumbnail ? (
						<Image
							src={item.thumbnail}
							height={48}
							width={36}
							alt={`Image summary ${item.title}`}
							className="object-cover"
						/>
					) : (
						<PlaceholderImage />
					)}
				</div>
				<div className="flex max-w-[185px] flex-col justify-center text-[12px]">
					<span className="font-normal text-gray-900 truncate">
						{item.title}
					</span>
					{item?.variant && (
						<span className="font-normal text-gray-500 truncate">
							{`${item.variant.title}${
								item.variant.sku ? ` (${item.variant.sku})` : ''
							}`}
						</span>
					)}
				</div>
			</div>
			<div className="flex items-center">
				<InputNumber
					className="w-[90px]"
					max={Math.min(
						getFulfillAbleQuantity(item),
						...[hasInventoryItem ? availableQuantity || 0 : Number.MAX_VALUE]
					)}
					min={0}
					allowClear={true}
					defaultValue={getFulfillAbleQuantity(item)}
					addonAfter={
						<span className="flex text-gray-500 text-xs">
							{'/'}
							<span className="pl-1">{getFulfillAbleQuantity(item)}</span>
						</span>
					}
					size="middle"
					value={quantities[item.id]}
					onChange={(value: any) => handleQuantityUpdate(value, item.id)}
				/>
			</div>
		</div>
	);
};
