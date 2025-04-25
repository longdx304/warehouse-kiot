import { Col, Form, Input, Row } from 'antd';

type AddressContactFormProps = {
	form: any;
};

const AddressContactForm = ({ form }: AddressContactFormProps) => {
	return (
		<Row gutter={[16, 8]} className="gap-y-0">
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['contact', 'first_name']}
					label="Tên"
					rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['contact', 'last_name']}
					label="Họ"
					rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['contact', 'phone']}
					label="Số điện thoại"
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['contact', 'company']}
					label="Công ty"
				>
					<Input />
				</Form.Item>
			</Col>
		</Row>
	);
};

export default AddressContactForm;
