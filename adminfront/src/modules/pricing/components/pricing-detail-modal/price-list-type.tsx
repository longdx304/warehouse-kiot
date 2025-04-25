import { Flex } from '@/components/Flex';
import { Radio, RadioGroup } from '@/components/Radio';
import { Text } from '@/components/Typography';
import { Col, Form, Row } from 'antd';

const PriceListType = ({}) => {
	return (
		<Row gutter={[16, 8]} className="pt-4">
			<Col span={24}>
				<Flex vertical className="mb-4">
					<Text strong className="text-sm">
						Loại giá
					</Text>
					<Text className="text-[13px] text-gray-600">
						Chọn loại danh sách giá bạn muốn tạo
					</Text>
				</Flex>
				<Form.Item
					name={['type', 'value']}
					initialValue="sale"
					className="mb-0"
					colon={false}
					labelCol={{ span: 24 }}
				>
					<RadioGroup className="w-full flex">
						<Radio
							value="sale"
							className="border border-solid border-gray-200 rounded-md px-4 py-2"
						>
							<Flex vertical justify="flex-start" align="flex-start">
								<Text className="text-[13px]" strong>
									Khuyến mãi
								</Text>
								<Text className="text-[13px] text-gray-600">
									Sử dụng điều này nếu bạn đang tạo một chương trình khuyến mãi
								</Text>
							</Flex>
						</Radio>
						<Radio
							value="override"
							className="border border-solid border-gray-200 rounded-md px-4 py-2"
						>
							<Flex vertical justify="flex-start" align="flex-start">
								<Text strong className="text-[13px]">
									Ghi đè
								</Text>
								<Text className="text-[13px] text-gray-600">
									Sử dụng điều này nếu bạn muốn ghi đè giá
								</Text>
							</Flex>
						</Radio>
					</RadioGroup>
				</Form.Item>
			</Col>
		</Row>
	);
};

export default PriceListType;
