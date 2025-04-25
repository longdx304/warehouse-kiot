import { Flex } from '@/components/Flex';
import { Radio, RadioGroup } from '@/components/Radio';
import { Text } from '@/components/Typography';
import { AllocationType, DiscountRuleType } from '@/types/discount';
import { Form } from 'antd';
import { useDiscountForm } from '../discount-form-context';

const DiscountType = () => {
	const { form } = useDiscountForm();
	const discountType = Form.useWatch(['rule', 'type'], form) || undefined;

	return (
		<div className="flex flex-col gap-4">
			<Form.Item
				name={['rule', 'type']}
				initialValue={DiscountRuleType.PERCENTAGE}
				className="mb-0"
				colon={false}
				labelCol={{ span: 24 }}
			>
				<RadioGroup className="w-full flex flex-wrap sm:flex-nowrap gap-4">
					<Radio
						value={DiscountRuleType.PERCENTAGE}
						className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
					>
						<Flex vertical justify="flex-start" align="flex-start">
							<Text className="text-[13px]" strong>
								Phần trăm
							</Text>
							<Text className="text-[13px] text-gray-600">
								Giảm giá áp dụng theo %
							</Text>
						</Flex>
					</Radio>
					<Radio
						value={DiscountRuleType.FIXED}
						className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
					>
						<Flex vertical justify="center" align="flex-start">
							<Text strong className="text-[13px]">
								Số tiền cố định
							</Text>
							<Text className="text-[13px] text-gray-600">
								Giảm giá theo số tiền
							</Text>
						</Flex>
					</Radio>
					<Radio
						value={DiscountRuleType.FREE_SHIPPING}
						className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
					>
						<Flex vertical justify="flex-start" align="flex-start">
							<Text strong className="text-[13px]">
								Miễn phí vận chuyển
							</Text>
							<Text className="text-[13px] text-gray-600">
								Ghi đè số tiền vận chuyển
							</Text>
						</Flex>
					</Radio>
				</RadioGroup>
			</Form.Item>
			{discountType === DiscountRuleType.FIXED && (
				<>
					<div className="flex">
						<Text strong>Phân bố</Text>
						<span className="text-rose-500">*</span>
					</div>
					<Form.Item
						name={['rule', 'allocation']}
						initialValue={AllocationType.TOTAL}
						className="mb-0"
						colon={false}
						labelCol={{ span: 24 }}
					>
						<RadioGroup className="w-full flex flex-wrap sm:flex-nowrap gap-4">
							<Radio
								value={AllocationType.TOTAL}
								className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
							>
								<Flex vertical justify="flex-start" align="flex-start">
									<Text className="text-[13px]" strong>
										Tổng số tiền
									</Text>
									<Text className="text-[13px] text-gray-600">
										Áp dụng cho tổng số tiền
									</Text>
								</Flex>
							</Radio>
							<Radio
								value={AllocationType.ITEM}
								className="border border-solid border-gray-200 rounded-md px-4 py-2 flex items-center"
							>
								<Flex vertical justify="flex-start" align="flex-start">
									<Text strong className="text-[13px]">
										Cụ thể cho từng mặt hàng
									</Text>
									<Text className="text-[13px] text-gray-600">
										Áp dụng cho mọi mặt hàng được cho phép
									</Text>
								</Flex>
							</Radio>
						</RadioGroup>
					</Form.Item>
				</>
			)}
		</div>
	);
};

export default DiscountType;
