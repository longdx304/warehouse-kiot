import clsx from 'clsx';
import { useEditConditionContext } from './edit-condition-provider';
import { Button } from '@/components/Button';
import { useAddConditionsModalScreen } from './add-conditions-screens';
import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import { useContext } from 'react';
import { PlusIcon } from 'lucide-react';

type Props = {
	numberOfSelectedRows: number;
	onDeselect: () => void;
	onRemove: () => void;
};

const ExistingConditionTableActions = ({
	onDeselect,
	onRemove,
	numberOfSelectedRows,
}: Props) => {
	const { condition } = useEditConditionContext();
	const { push } = useContext(LayeredModalContext);

	const addConditionsModalScreen = useAddConditionsModalScreen(condition);

	const showAddConditions = !!numberOfSelectedRows;

	const classes = {
		'translate-y-[-42px]': !showAddConditions,
		'translate-y-[0px]': showAddConditions,
	};

	return (
		<div className="space-x-2 flex h-[34px] overflow-hidden">
			<div className={clsx('transition-all duration-200', classes)}>
				<div className="mb-2 flex h-[34px] items-center divide-x">
					<div className="space-x-2 flex pl-3">
						<Button onClick={onDeselect} type="default">
							{'Bỏ chọn'}
						</Button>
						<Button
							onClick={onRemove}
							type="default"
							danger
							className="text-rose-500"
						>
							{'Xóa'}
						</Button>
					</div>
				</div>
				<div className="flex h-[34px] justify-start pl-3">
					<Button
						type="text"
						className="border-gray-200 border"
						onClick={() => push(addConditionsModalScreen)}
					>
						<PlusIcon size={20} /> {'Thêm'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ExistingConditionTableActions;
