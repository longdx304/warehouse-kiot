import { Button } from '@/components/Button';
import { LayeredModalContext } from '@/lib/providers/layer-modal-provider';
import { FC, useContext } from 'react';

type Props = {
	saveAndGoBack: () => void;
	saveAndClose: () => void;
	disabled?: boolean;
};

const ConditionTableFooter: FC<Props> = ({
	saveAndGoBack,
	saveAndClose,
	disabled,
}) => {
	const { pop } = useContext(LayeredModalContext);
	return (
		<div className="flex items-center justify-end gap-2 mt-4 pt-4 border-0 border-t border-solid border-gray-200">
			<Button
				onClick={() => pop()}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Quay lại
			</Button>
			<Button
				type="default"
				className="text-sm min-w-32 justify-center"
				onClick={() => saveAndGoBack()}
				disabled={disabled}
			>
				Lưu và quay lại
			</Button>
			<Button
				className="text-sm min-w-32 justify-center"
				onClick={() => saveAndClose()}
				disabled={disabled}
			>
				Lưu và thêm
			</Button>
		</div>
	);
};

export default ConditionTableFooter;
