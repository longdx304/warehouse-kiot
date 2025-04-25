import type { InputNumberProps } from 'antd';
import { InputNumber as AntdInputNumber, Flex } from 'antd';

import { cn } from '@/lib/utils';

interface Props extends InputNumberProps {
	className?: string;
	allowClear?: boolean;
}

export default function InputNumber({
	className,
	allowClear = false,
	...props
}: Readonly<Props>) {
	const formatter = (value: any) => {
		if (value) {
			return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		}
		return value;
	};

	const parser = (value: any) => {
		return value.replace(/\$\s?|(\.*)/g, '');
	};

	return (
		<Flex vertical gap={4} className="w-full">
			<AntdInputNumber
				size="large"
				className={cn('gap-2 w-full', className)}
				formatter={formatter}
				parser={parser}
				{...props}
			/>
		</Flex>
	);
}
