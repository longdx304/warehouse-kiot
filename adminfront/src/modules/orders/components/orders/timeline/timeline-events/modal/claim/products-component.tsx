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
	dataIndex: any;
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
	handleQuantity,
	handleReason = () => {},
	...restProps
}: EditableCellProps) => {
	const [showReturnReason, setShowReturnReason] = useState<boolean>(false);
	let childNode = children;

	if (editable) {
		childNode = (
			<div>
				<div className="text-gray-500 flex w-full justify-start text-right">
					<div
						onClick={() => handleQuantity(-1, record)}
						className="hover:bg-gray-200 mr-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md"
					>
						<Minus size={16} />
					</div>
					<span>{record[dataIndex] || ''}</span>
					<div
						onClick={() => handleQuantity(1, record)}
						className={clsx(
							'hover:bg-gray-200 ml-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md'
						)}
					>
						<Plus size={16} />
					</div>
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
							handleReason(reason, record.item_id)
						}
						initValue={{ reason: record?.reason, note: record?.note }}
						isClaim={true}
					/>
				)}
			</div>
		);
	}

	return <td {...restProps}>{childNode}</td>;
};
