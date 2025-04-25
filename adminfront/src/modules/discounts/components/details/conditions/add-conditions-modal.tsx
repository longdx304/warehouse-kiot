import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { useContext, useEffect, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import useConditionModalItems, {
	ConditionItem,
} from '../../discount-form/use-condition-modal-item';
import { useConditions } from './conditions-provider';

type AddConditionsModalProps = {
	isDetails?: boolean;
	open: boolean;
	onClose: () => void;
};

const AddConditionsModal = ({
	isDetails = false,
	open = false,
	onClose = () => {},
}: AddConditionsModalProps) => {
	const layeredModalContext = useContext(LayeredModalContext);
	const { conditions, save, reset } = useConditions();
	const [items, setItems] = useState<ConditionItem[]>(
		useConditionModalItems({
			onClose,
			isDetails,
		})
	);

	useEffect(() => {
		const setConditions: string[] = [];
		for (const [key, value] of Object.entries(conditions)) {
			// If we are in the details view we only want to view the conditions that haven't already been added,
			// meaning !id. We don't support updating existing conditions through the admin atm.
			const filter = isDetails ? value.id : value.items.length;

			if (filter) {
				setConditions.push(key);
			}
		}

		setItems(items.filter((i) => !setConditions.includes(i.value)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conditions]);

	const onCancel = () => {
		onClose();
		reset();
	};

	const onOk = () => {
		save();
		onClose();
	};
	return (
		<LayeredModal
			context={layeredModalContext}
			onCancel={onCancel}
			onOk={onOk}
			open={open}
			// footer={footer}
			title="Thêm mã giảm giá"
			className="layered-modal"
			width={800}
		>
			<div className="mt-2">
				{items.length ? (
					items.map((t) => <ConditionTypeItem key={t.value} {...t} />)
				) : (
					<div className="flex h-full flex-1 flex-col items-center justify-center">
						<span className="font-normal text-gray-400">
							{'Mã giảm giá của bạn đã chứa tất cả các điều kiện có thể có.'}
						</span>
					</div>
				)}
			</div>
		</LayeredModal>
	);
};

export default AddConditionsModal;

const ConditionTypeItem: React.FC<ConditionItem> = (props) => {
	const { label, description, onClick } = props;

	return (
		<button
			onClick={onClick}
			className="border border-gray-500/20 bg-white hover:bg-gray-50 mb-2 flex w-full cursor-pointer items-center justify-between rounded-lg p-4 transition-all"
		>
			<div className="flex flex-col items-start gap-1">
				<div className="font-semibold text-sm">{label}</div>
				<div className="text-gray-500">{description}</div>
			</div>
			<ChevronRightIcon width={16} height={32} className="text-gray-500" />
		</button>
	);
};
