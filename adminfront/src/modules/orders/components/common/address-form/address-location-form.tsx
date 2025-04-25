import { Col, Form, Input, Row, Select } from 'antd';

type AddressLocationFormProps = {
	form: any;
	countryOptions: { label: string; value: string }[];
};

const AddressLocationForm = ({
	form,
	countryOptions,
}: AddressLocationFormProps) => {
	return (
		<Row gutter={[16, 8]} className="gap-y-0">
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'address_1']}
					label="Địa chỉ 1"
					rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'address_2']}
					label="Địa chỉ 2"
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'city']}
					label="Thành phố"
					rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'province']}
					label="Tỉnh/Thành phố"
				>
					<Input />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'country_code']}
					label="Quốc gia"
					rules={[{ required: true, message: 'Vui lòng chọn quốc gia' }]}
				>
					<Select options={countryOptions} />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['location', 'postal_code']}
					label="Mã bưu chính"
				>
					<Input />
				</Form.Item>
			</Col>
		</Row>
	);
};

export default AddressLocationForm;
