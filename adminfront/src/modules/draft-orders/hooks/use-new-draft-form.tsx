import { Option } from '@/types/products';
import { AddressPayload, Region, ShippingOption } from '@medusajs/medusa';
import { Form } from 'antd';
import {
	useAdminRegion,
	useAdminShippingOption,
	useAdminShippingOptions,
} from 'medusa-react';
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

export type NewDraftOrderForm = {
	shipping_address: AddressPayload;
	shipping_address_id?: string;
	billing_address: AddressPayload;
	billing_address_id?: string;
	region: string | null;
	items: {
		quantity: number;
		variant_id: string;
		title: string;
		unit_price: number;
		thumbnail?: string | null;
		product_title?: string;
	}[];
	shipping_option: string | null;
	customer_id?: any | null;
	email: string;
	custom_shipping_price?: number;
	discount_code?: string;
	same_as_shipping?: boolean;
};

type NewDraftOrderContextValue = {
	validCountries: Option[];
	region: Region | undefined;
	selectedShippingOption: ShippingOption | undefined;
	items: NewDraftOrderForm['items'];
	shippingOptions: ShippingOption[];
	setDataFromExcel: (data: any[]) => void;
	dataFromExcel: any[];
	setItems: React.Dispatch<React.SetStateAction<NewDraftOrderForm['items']>>;
};

const NewDraftOrderContext = createContext<NewDraftOrderContextValue | null>(
	null
);

const NewDraftOrderFormProvider = ({ children }: { children?: ReactNode }) => {
	const [form] = Form.useForm<NewDraftOrderForm>();

	const selectedRegionId = Form.useWatch('region', form);
	const [cachedRegion, setCachedRegion] = useState<Region | undefined>();
	const [itemsSelected, setItemsSelected] = useState<
		NewDraftOrderForm['items']
	>([]);
	const [dataFromExcel, setDataFromExcel] = useState<any[]>([]);

	const { region } = useAdminRegion(selectedRegionId!, {
		enabled: !!selectedRegionId,
	});

	useEffect(() => {
		if (region) setCachedRegion(region);
	}, [region]);

	const selectedShippingOption = Form.useWatch('shipping_option', form);

	const [cachedShippingOption, setCachedShippingOption] = useState<
		ShippingOption | undefined
	>();

	const { shipping_option } = useAdminShippingOption(selectedShippingOption!, {
		enabled: !!selectedShippingOption,
	});

	useEffect(() => {
		if (shipping_option) {
			setCachedShippingOption(shipping_option);
		}
	}, [shipping_option]);

	const validCountries = useMemo(() => {
		return cachedRegion
			? cachedRegion.countries.map((country) => ({
					label: country.display_name,
					value: country.iso_2,
			  }))
			: [];
	}, [cachedRegion]);

	const { shipping_options } = useAdminShippingOptions(
		{
			region_id: cachedRegion?.id,
			is_return: false,
		},
		{
			enabled: !!cachedRegion,
		}
	);

	const validShippingOptions = useMemo(() => {
		if (!shipping_options) {
			return [];
		}

		const formValues = form.getFieldsValue();
		const total = formValues.items?.reduce((acc, next) => {
			return acc + next.quantity * next.unit_price;
		}, 0);

		return shipping_options?.reduce((acc, next) => {
			if (next.requirements) {
				const minSubtotal = next.requirements.find(
					(req) => req.type === 'min_subtotal'
				);
				const maxSubtotal = next.requirements.find(
					(req) => req.type === 'max_subtotal'
				);

				if (
					(minSubtotal && total <= minSubtotal.amount) ||
					(maxSubtotal && total >= maxSubtotal.amount)
				) {
					return acc;
				}
			}
			acc.push(next);
			return acc;
		}, [] as ShippingOption[]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shipping_options, form]);

	useEffect(() => {
		const formValues = form.getFieldsValue();
		setItemsSelected(formValues.items);
	}, [form]);

	const contextValue = useMemo(
		() => ({
			validCountries,
			region: cachedRegion,
			selectedShippingOption: cachedShippingOption,
			items: itemsSelected,
			shippingOptions: validShippingOptions,
			setDataFromExcel,
			dataFromExcel,
			setItems: setItemsSelected,
		}),
		[
			validCountries,
			cachedRegion,
			cachedShippingOption,
			itemsSelected,
			validShippingOptions,
			setItemsSelected,
			setDataFromExcel,
			dataFromExcel,
		]
	);

	return (
		<NewDraftOrderContext.Provider value={contextValue}>
			<Form form={form} layout="vertical" autoComplete="off">
				{children}
			</Form>
		</NewDraftOrderContext.Provider>
	);
};

export const useNewDraftOrderForm = () => {
	const context = useContext(NewDraftOrderContext);
	const form = Form.useFormInstance<NewDraftOrderForm>();

	if (!context) {
		throw new Error(
			'useNewDraftOrderForm must be used within NewDraftOrderFormProvider'
		);
	}

	return { context, form };
};

export default NewDraftOrderFormProvider;
