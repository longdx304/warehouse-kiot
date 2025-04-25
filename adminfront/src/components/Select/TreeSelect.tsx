import { cn } from '@/lib/utils';

import { TreeSelect as AntdTreeSelect, TreeSelectProps } from 'antd';

const { SHOW_PARENT } = AntdTreeSelect;

interface Props extends TreeSelectProps {
	className?: string;
	title: string;
	treeData: any;
	value?: any;
	onChange?: (value: any) => void;
	dataTestId: string;
}

export default function TreeSelect({
	className,
	treeData,
	value,
	title,
	onChange,
	dataTestId,
}: Props) {
	const tProps = {
		treeData,
		value,
		onChange,
		treeCheckable: true,
		showCheckedStrategy: SHOW_PARENT,
		placeholder: title,
		style: {
			width: '100%',
		},
	};

	return (
		<AntdTreeSelect
			size="large"
			className={cn('', className)}
			// treeLine={true}
			{...tProps}
			data-testid={dataTestId}
		/>
	);
}
