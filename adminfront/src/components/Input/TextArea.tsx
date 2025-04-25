import { Input as AntdInput, InputProps as AntdTextAreaProps } from 'antd';
import { cn } from '@/lib/utils';
import { Flex } from '@/components/Flex';
import { ErrorText } from '@/components/Typography';

interface Props extends AntdTextAreaProps {
	className?: string;
	error?: string;
	rows?: number;
	placeholder?: string;
}

const { TextArea: AntdTextArea } = AntdInput;

export default function TextArea({
	rows = 3,
	error,
	className,
	placeholder,
	...props
}: Props) {
	return (
		<Flex vertical gap={4} className="w-full">
			<AntdTextArea
				placeholder={placeholder}
				rows={rows}
				size="small"
				className={cn('p-3 gap-2', className)}
				{...props as any}
			/>
			{error && <ErrorText error={error} />}
		</Flex>
	);
}
