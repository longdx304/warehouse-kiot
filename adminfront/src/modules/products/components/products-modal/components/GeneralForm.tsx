import { FC } from 'react';
import { Form, Row, Col } from 'antd';
import {
	BadgeDollarSign,
	CandlestickChart,
	Layers,
	Palette,
	Sigma,
	UserRound,
	CircleAlert,
} from 'lucide-react';

import { Flex } from '@/components/Flex';
import { Input, TextArea } from '@/components/Input';
import { Checkbox } from '@/components/Checkbox';
import { Switch } from '@/components/Switch';

interface Props {}

const GeneralForm: FC<Props> = () => {
	return (
		<div className="w-full text-gray-500">
			<span>{'Để bắt đầu bán hàng bạn cần nhập các thông tin dưới đây'}</span>
			<Row gutter={[16, 8]} className="pt-4">
				<Col span={24}>
					<Form.Item
						labelCol={{ span: 24 }}
						name={['general', 'title']}
						rules={[
							{
								required: true,
								message: 'Tên sản phẩm phải có ít nhất 2 ký tự!',
							},
						]}
						label="Tên sản phẩm:"
						// initialValue={product?.title}
					>
						<Input
							placeholder="Giày Nam"
							prefix={<Layers />}
							data-testid="title"
						/>
					</Form.Item>
					<Flex vertical className="text-xs">
						<span>{`Đặt tiêu đề ngắn và rõ ràng cho sản phẩm của bạn.`}</span>
						<span>{`Độ dài 50-60 ký tự là độ dài được khuyến nghị cho các công cụ tìm kiếm.`}</span>
					</Flex>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item
						labelCol={{ span: 24 }}
						name={['general', 'handle']}
						label="Tiêu đề URL sản phẩm:"
						tooltip={{
							title:
								'URL Slug cho sản phẩm. Sẽ được tự động tạo nếu để trống',
							icon: <CircleAlert size={18} />,
						}}
						rules={[
							{
								pattern: /^[A-Za-z0-9-_]+$/,
								message: 'Url không được có dấu hoặc khoảng trắng.',
							},
						]}
						// initialValue={product?.title}
					>
						<Input
							placeholder="giay-nam"
							prefix={<span className="text-gray-300">{'/'}</span>}
							data-testid="title"
						/>
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item
						labelCol={{ span: 24 }}
						name={['general', 'material']}
						label="Vật liệu:"
						// initialValue={product?.title}
					>
						<Input placeholder="100% Cotton" data-testid="title" />
					</Form.Item>
				</Col>
				<Col span={24}>
					<Form.Item
						labelCol={{ span: 24 }}
						name={['general', 'description']}
						label="Mô tả:"
						// initialValue={product?.title}
					>
						<TextArea
							placeholder="Giày nam và thời thượng"
							rows={3}
							maxLength={160}
						/>
					</Form.Item>
					<Flex vertical className="text-xs">
						<span>{`Đặt cho sản phẩm của bạn một mô tả ngắn gọn và rõ ràng.`}</span>
						<span>{`Độ dài 120-160 ký tự được khuyến nghị cho các công cụ tìm kiếm.`}</span>
					</Flex>
				</Col>
				<Col span={24}>
					<Form.Item
						name={['general', 'discounted']}
						label="Áp dụng khuyến mãi"
						initialValue={true}
						className="mb-0"
						colon={false}
					>
						<Switch className="float-right" />
					</Form.Item>
					<div className="text-gray-500 text-xs">{`Khi không được chọn, các khuyến mãi sẽ không áp dụng cho sản phẩm này.`}</div>
				</Col>
			</Row>
		</div>
	);
};

export default GeneralForm;
