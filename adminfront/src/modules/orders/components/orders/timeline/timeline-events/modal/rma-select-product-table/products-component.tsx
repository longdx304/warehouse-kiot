import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { Plus, Minus } from 'lucide-react';
import { LineItem } from '@medusajs/medusa';
import { Button } from '@/components/Button';
import ReturnReasonModal from '../rma-return-reason-modal';

export const EditableRow = ({ index, ...props }: { index: number }) => {
	// const [form] = Form.useForm();
	return (
		// <Form form={form} component={false}>
		//   <EditableContext.Provider value={form}>
		<tr {...props} />
		//   </EditableContext.Provider>
		// </Form>
	);
};

interface EditableCellProps {
	title: ReactNode;
	editable: boolean;
	children: ReactNode;
	dataIndex: keyof Omit<LineItem, 'beforeInsert'>;
	record: any;
	handleQuantity: (
		change: number,
		item: Omit<LineItem, 'beforeInsert'>
	) => void;
	handleReason?: (reason: any, itemId: string) => void;
}

export const EditableCell = ({
	title,
	editable,
	children,
	dataIndex,
	record,
	handleReason = () => {},
	handleQuantity,
	...restProps
}: EditableCellProps) => {
	const [showReturnReason, setShowReturnReason] = useState<boolean>(false);
	let childNode = children;

	if (editable) {
		childNode = (
			<div>
				<div className="text-gray-500 flex w-full justify-start text-right">
					<span
						onClick={() => handleQuantity(-1, record)}
						className="hover:bg-gray-200 mr-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md"
					>
						<Minus size={16} />
					</span>
					<span>{(record[dataIndex] as any) || ''}</span>
					<span
						onClick={() => handleQuantity(1, record)}
						className={clsx(
							'hover:bg-gray-200 ml-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md'
						)}
					>
						<Plus size={16} />
					</span>
				</div>
				<Button
					type="default"
					className="mt-2"
					onClick={() => setShowReturnReason(true)}
				>
					Chọn lý do
				</Button>
				{showReturnReason && (
					<ReturnReasonModal
						state={showReturnReason}
						onClose={() => setShowReturnReason(false)}
						onSubmit={(reason: { reason?: any; note?: string }) =>
							handleReason(reason, record.id)
						}
						initValue={{ reason: record?.reason, note: record?.note }}
					/>
				)}
			</div>
		);
	}

	return <td {...restProps}>{childNode}</td>;
};
