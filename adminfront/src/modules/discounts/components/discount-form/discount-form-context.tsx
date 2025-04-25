import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';

import {
	AllocationType,
	ConditionMap,
	DiscountConditionOperator,
	DiscountConditionType,
	DiscountFormValues,
	DiscountRuleType,
	UpdateConditionProps,
} from '@/types/discount';
import { Form, FormInstance } from 'antd';
import dayjs from 'dayjs';
// import { DiscountFormValues } from "./mappers"

type DiscountFormProviderProps = {
	children?: React.ReactNode;
};

const defaultConditions: ConditionMap = {
	products: {
		id: undefined,
		operator: DiscountConditionOperator.IN,
		type: DiscountConditionType.PRODUCTS,
		items: [],
	},
	product_collections: {
		id: undefined,
		operator: DiscountConditionOperator.IN,
		type: DiscountConditionType.PRODUCT_COLLECTIONS,
		items: [],
	},
	product_tags: {
		id: undefined,
		operator: DiscountConditionOperator.IN,
		type: DiscountConditionType.PRODUCT_TAGS,
		items: [],
	},
	product_types: {
		id: undefined,
		operator: DiscountConditionOperator.IN,
		type: DiscountConditionType.PRODUCT_TYPES,
		items: [],
	},
	customer_groups: {
		id: undefined,
		operator: DiscountConditionOperator.IN,
		type: DiscountConditionType.CUSTOMER_GROUPS,
		items: [],
	},
};

type DiscountFormContextType = {
	form: FormInstance<DiscountFormValues>;
	type?: string;
	isDynamic: boolean;
	hasExpiryDate: boolean;
	setHasExpiryDate: (value: boolean) => void;
	hasStartDate: boolean;
	setHasStartDate: (value: boolean) => void;
	handleConfigurationChanged: (values: string[]) => void;
	conditions: ConditionMap;
	updateCondition: (props: UpdateConditionProps) => void;
	setConditions: Dispatch<SetStateAction<ConditionMap>>;
	handleReset: () => void;
};
const defaultDiscountContext: DiscountFormContextType = {
	form: {} as FormInstance<DiscountFormValues>,
	type: undefined,
	isDynamic: false,
	hasExpiryDate: false,
	setHasExpiryDate: () => {},
	hasStartDate: false,
	setHasStartDate: () => {},
	handleConfigurationChanged: () => {},
	conditions: defaultConditions,
	updateCondition: () => {},
	setConditions: () => {},
	handleReset: () => {},
};
const DiscountFormContext = React.createContext(defaultDiscountContext);

export const DiscountFormProvider = ({
	children,
}: DiscountFormProviderProps) => {
	const [form] = Form.useForm();
	const [hasExpiryDate, setHasExpiryDate] = useState(false);
	const [hasStartDate, setHasStartDate] = useState(false);
	const [prevUsageLimit, setPrevUsageLimit] = useState<number | null>(null);
	const [prevValidDuration, setPrevValidDuration] = useState<string | null>(
		null
	);

	const [conditions, setConditions] = useState<ConditionMap>(defaultConditions);

	const updateCondition = ({ type, items, operator }: UpdateConditionProps) => {
		setConditions((prevConditions) => ({
			...prevConditions,
			[type]: {
				...prevConditions[type],
				items,
				operator,
			},
		}));
	};

	const type = Form.useWatch(['rule', 'type'], form) || undefined;
	const isDynamic = Form.useWatch('is_dynamic', form) || false;
	const usageLimit = Form.useWatch('usage_limit', form) || undefined;
	const validDuration = Form.useWatch('valid_duration', form) || undefined;
	const endsAt = Form.useWatch('ends_at', form) || undefined;
	const startsAt = Form.useWatch('starts_at', form) || undefined;

	useEffect(() => {
		if (hasExpiryDate && !endsAt) {
			form.setFieldValue(
				'ends_at',
				dayjs().add(7, 'day')
				// new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
			);
		}

		if (!hasExpiryDate && endsAt) {
			form.setFieldValue('ends_at', undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [endsAt, hasExpiryDate]);

	useEffect(() => {
		if (hasStartDate && !startsAt) {
			form.setFieldValue('starts_at', dayjs());
		}

		if (!hasStartDate && startsAt) {
			form.setFieldValue('starts_at', undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startsAt, hasStartDate]);

	const handleConfigurationChanged = (values: string[]) => {
		const handleExpiryDate = () => {
			if (values.indexOf('ends_at') > -1 && !hasExpiryDate) {
				setHasExpiryDate(true);
			} else if (values.indexOf('ends_at') === -1 && hasExpiryDate) {
				setHasExpiryDate(false);
			}
		};

		const handleStartDate = () => {
			if (values.indexOf('starts_at') === -1 && hasStartDate) {
				setHasStartDate(false);
			} else if (values.indexOf('starts_at') > -1 && !hasStartDate) {
				setHasStartDate(true);
			}
		};

		const handleUsageLimit = () => {
			if (values.indexOf('usage_limit') === -1 && usageLimit) {
				setPrevUsageLimit(usageLimit);
				// debounce the setValue call to not flash an empty field when collapsing the accordion
				setTimeout(() => {
					form.setFieldValue('usage_limit', null);
				}, 300);
			} else if (values.indexOf('usage_limit') > -1 && usageLimit) {
				form.setFieldValue('usage_limit', prevUsageLimit);
			}
		};

		const handleValidDuration = () => {
			if (values.indexOf('valid_duration') === -1 && validDuration !== '') {
				setPrevValidDuration(validDuration);
				// debounce the setValue call to not flash an empty field when collapsing the accordion
				setTimeout(() => {
					form.setFieldValue('valid_duration', '');
				}, 300);
			} else if (
				values.indexOf('valid_duration') > -1 &&
				validDuration === ''
			) {
				form.setFieldValue('valid_duration', prevValidDuration);
			}
		};

		handleExpiryDate();
		handleStartDate();
		handleUsageLimit();
		handleValidDuration();
	};

	const handleReset = () => {
		form.resetFields();
		setConditions(defaultConditions);
		setHasExpiryDate(false);
		setHasStartDate(false);
	};

	const value = {
		form,
		type,
		isDynamic,
		hasExpiryDate,
		setHasExpiryDate,
		hasStartDate,
		setHasStartDate,
		handleConfigurationChanged,
		conditions,
		updateCondition,
		setConditions,
		handleReset,
	};
	return (
		<DiscountFormContext.Provider value={value}>
			{children}
		</DiscountFormContext.Provider>
	);
};

export const useDiscountForm = () => {
	const context = React.useContext(DiscountFormContext);
	if (context === undefined) {
		throw new Error(
			'useDiscountForm must be used within a DiscountFormProvider'
		);
	}
	return context;
};
