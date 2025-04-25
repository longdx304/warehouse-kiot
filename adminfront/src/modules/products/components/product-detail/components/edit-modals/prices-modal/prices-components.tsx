// @ts-nocheck
import { currencies as CURRENCY_MAP } from '@/types/currencies';
import { Region } from '@medusajs/medusa';
import type { GetRef, InputRef } from 'antd';
import { Form, InputNumber, message } from 'antd';
import {
	FC,
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = createContext<FormInstance<any> | null>(null);
interface EditableRowProps {
	index: number;
}
export const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
	const [form] = Form.useForm();
	return (
		<Form form={form} component={false}>
			<EditableContext.Provider value={form}>
				<tr {...props} />
			</EditableContext.Provider>
		</Form>
	);
};

/**
 * Return currency metadata or metadata of region's currency
 */
function useCurrencyMeta(
	storeRegions: any,
	currencyCode: string | undefined,
	regionId: string | undefined
) {
	if (currencyCode) {
		return CURRENCY_MAP[currencyCode?.toUpperCase()];
	}

	// if (storeRegions) {
	// 	const region = regions.find((r) => r.id === regionId);
	// 	return CURRENCY_MAP[storeRegions!.currency_code.toUpperCase()];
	// }
}

interface EditableCellProps {
	title: ReactNode;
	editable: boolean;
	children: ReactNode;
	dataIndex: keyof Item;
	record: Item;
	handleSave: (record: Item) => void;
	storeRegions: Region;
}

export const EditableCell: FC<EditableCellProps> = ({
	title,
	editable,
	children,
	dataIndex,
	record,
	handleSave,
	storeRegions,
	...restProps
}) => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const currencyMeta = dataIndex && useCurrencyMeta(storeRegions, dataIndex[1]);
	const [editing, setEditing] = useState(false);
	const inputRef = useRef<InputRef>(null);
	const form = useContext(EditableContext);
	const [messageApi] = message.useMessage();

	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
		}
	}, [editing]);

	const toggleEdit = () => {
		setEditing(!editing);
	};
	const save = async () => {
		try {
			const values = await form.validateFields();
			toggleEdit();
			handleSave({
				...record,
				pricesFormat: {
					...record.pricesFormat,
					[dataIndex[1]]: values.pricesFormat[dataIndex[1]],
				},
			});
		} catch (errInfo) {
			messageApi.open({
				type: 'error',
				content: 'Có lỗi xảy ra, vui lòng thử lại sau.',
			});
		}
	};
	let childNode = children;
	const parser = (value) => {
		return value.replace(/\$\s?|(,*)/g, '');
	};
	const formatter = (value) => {
		if (value) {
			return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
		return value;
	};

	useEffect(() => {
		if (dataIndex) {
			form.setFieldsValue({
				pricesFormat: {
					[dataIndex[1]]: record?.pricesFormat[dataIndex[1]],
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [record, dataIndex]);
	if (editable) {
		childNode = editing ? (
			<Form.Item
				style={{
					margin: 0,
				}}
				name={dataIndex}
				rules={[
					{
						type: 'number',
						message: `Giá tiền phải là chữ số.`,
					},
				]}
			>
				<InputNumber
					ref={inputRef}
					prefix={currencyMeta?.symbol_native}
					className="w-full"
					onPressEnter={save}
					onBlur={save}
					formatter={formatter}
					parser={parser}
					variant="borderless"
				/>
			</Form.Item>
		) : (
			<div
				className="editable-cell-value-wrap"
				style={{
					paddingRight: 24,
				}}
				onClick={toggleEdit}
			>
				{children}
			</div>
		);
	}
	return <td {...restProps}>{childNode}</td>;
};
