import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { cn } from '@/lib/utils';
import { Flex } from '@/components/Flex';
import { Text, ErrorText } from '@/components/Typography';


interface Props extends AntdInputProps {
	className?: string;
	label?: string;
	error?: string;
}

export default function InputWithLabel({ error, label, className, ...props }: Props) {
	return (
		<Flex vertical gap={4}>
			<Text strong>{label}</Text>
			<AntdInput size="large" className={cn('p-3 gap-2', className)} {...props} />
			{error && <ErrorText error={error} />}
		</Flex>
	);
}
