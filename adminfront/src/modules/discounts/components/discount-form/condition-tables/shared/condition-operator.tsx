import { Flex } from '@/components/Flex';
import { Radio, RadioGroup } from '@/components/Radio';
import { Text } from '@/components/Typography';
import { DiscountConditionOperator } from '@/types/discount';
import { FC } from 'react';

type ConditionOperatorProps = {
	value: 'in' | 'not_in';
	onChange: (value: DiscountConditionOperator) => void;
};

const ConditionOperator: FC<ConditionOperatorProps> = ({ value, onChange }) => {
	return (
		<RadioGroup
			value={value}
			onChange={(e) => onChange(e.target.value as DiscountConditionOperator)}
			className="w-full flex flex-wrap sm:flex-nowrap gap-4 mt-4"
		>
			<Radio
				value={DiscountConditionOperator.IN}
				className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
			>
				<Flex vertical justify="flex-start" align="flex-start">
					<Text className="text-[13px]" strong>
						In
					</Text>
					<Text className="text-[13px] text-gray-600">
						Áp dụng cho các sản phẩm được chọn
					</Text>
				</Flex>
			</Radio>
			<Radio
				value={DiscountConditionOperator.NOT_IN}
				className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
			>
				<Flex vertical justify="center" align="flex-start">
					<Text strong className="text-[13px]">
						Not in
					</Text>
					<Text className="text-[13px] text-gray-600">
						Áp dụng cho các tất cả các sản phẩm ngoại trừ các sản phẩm được chọn
					</Text>
				</Flex>
			</Radio>
		</RadioGroup>
	);
};

export default ConditionOperator;
