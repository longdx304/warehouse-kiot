import { Flex } from '@/components/Flex';
import { Input, TextArea } from '@/components/Input';
import DatePicker from '@/components/Input/DatePicker';
import { Switch } from '@/components/Switch';
import { Text } from '@/components/Typography';
import { PriceList } from '@medusajs/medusa';
import { Col, Form, Row } from 'antd';
import { useEffect, useState } from 'react';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';

dayjs.extend(customParseFormat);
type Props = {
	form?: any;
	priceList?: PriceList;
};

const PriceListGeneral = ({ form, priceList }: Props) => {
	const [isStartDate, setIsStartDate] = useState<boolean>(false);
	const [isEndDate, setIsEndDate] = useState<boolean>(false);

	useEffect(() => {
		if (priceList?.starts_at) {
			setIsStartDate(true);
			form.setFieldsValue({
				dates: {
					starts_at: dayjs(priceList.starts_at),
				},
			});
		}
		if (priceList?.ends_at) {
			setIsEndDate(true);
			form.setFieldsValue({
				dates: {
					ends_at: dayjs(priceList.ends_at),
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [priceList]);

	return (
		<Row gutter={[16, 16]} className="pt-6">
			<Col span={24}>
				<Flex vertical>
					<Text strong className="text-sm">
						Thông tin chung
					</Text>
					<Text className="text-[13px] text-gray-600">
						Chọn tiêu đề và mô tả cho danh sách.
					</Text>
				</Flex>
			</Col>
			<Col xs={24} lg={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['general', 'name']}
					label="Tên"
					className="mb-0"
					rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
				>
					<Input data-testid="input-name" placeholder="Khuyến mãi Black Friday" />
				</Form.Item>
			</Col>
			<Col xs={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['general', 'description']}
					label="Mô tả"
					className="mb-0"
					rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
				>
					<TextArea data-testid="input-description" placeholder="Mô tả về chương trình khuyến mãi" rows={2} />
				</Form.Item>
			</Col>
			<Col span={24} className="mt-2">
				<Flex justify="space-between" align="center">
					<Flex vertical>
						<Text strong className="text-sm">
							Danh sách giá có ngày bắt đầu
						</Text>
						<Text className="text-[13px] text-gray-600">
							Lên lịch các giá trị ghi đè để kích hoạt trong tương lai
						</Text>
					</Flex>
					<Switch
						value={isStartDate}
						onChange={(checked: boolean) => setIsStartDate(checked)}
						className=""
					/>
				</Flex>
				{isStartDate && (
					<Form.Item
						labelCol={{ span: 24 }}
						name={['dates', 'starts_at']}
						label="Ngày bắt đầu"
						className="mb-0 mt-4"
						rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
						// initialValue={moment().format('DD/MM/YYYY')}
					>
						<DatePicker placeholder="Chọn ngày bắt đầu" className="w-[300px]" />
					</Form.Item>
				)}
			</Col>
			<Col span={24} className="mt-2">
				<Flex justify="space-between" align="center">
					<Flex vertical>
						<Text strong className="text-sm">
							Danh sách giá có ngày kết thúc
						</Text>
						<Text className="text-[13px] text-gray-600">
							Lên lịch các giá trị ghi đè để ngừng hoạt động trong tương lai
						</Text>
					</Flex>
					<Switch
						value={isEndDate}
						onChange={(checked: boolean) => setIsEndDate(checked)}
						className=""
					/>
				</Flex>
				{isEndDate && (
					<Form.Item
						labelCol={{ span: 24 }}
						name={['dates', 'ends_at']}
						label="Ngày kết thúc"
						className="mb-0 mt-4"
						rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
					>
						<DatePicker
							placeholder="Chọn ngày kết thúc"
							className="w-[300px]"
						/>
					</Form.Item>
				)}
			</Col>
		</Row>
	);
};

export default PriceListGeneral;
