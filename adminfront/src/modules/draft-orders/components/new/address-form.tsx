import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Title } from '@/components/Typography';
import { Option } from '@/types/shared';
import { Customer } from '@medusajs/medusa';
import { Checkbox, Col, Divider, Form, Row } from 'antd';
import React, { useEffect } from 'react';

export type AddressPayload = {
	first_name: string;
	last_name: string;
	company: string | null;
	address_1: string;
	address_2: string | null;
	city: string;
	province: string | null;
	country_code: Option;
	postal_code: string;
	phone: string | null;
};

export enum AddressType {
	SHIPPING = 'shipping',
	BILLING = 'billing',
	LOCATION = 'location',
}

type AddressFormProps = {
	form: any;
	countryOptions: Option[];
	type: AddressType;
	noTitle?: boolean;
	customer?: Customer;
};

const AddressForm = ({
	form,
	countryOptions,
	type,
	noTitle = false,
	customer,
}: AddressFormProps) => {
	const [sameAsShipping, setSameAsShipping] = React.useState(true);

	// Watch for changes in shipping address fields
	const shippingAddress = Form.useWatch(['shipping_address'], form);

	// Update billing address when shipping address changes and sameAsShipping is true
	useEffect(() => {
		if (sameAsShipping && shippingAddress) {
			form.setFieldsValue({
				billing_address: {
					...shippingAddress,
				},
			});
		}
	}, [shippingAddress, sameAsShipping, form]);

	const handleSameAsShippingChange = (checked: boolean) => {
		setSameAsShipping(checked);
		if (checked) {
			// Update billing address with current shipping address values
			form.setFieldsValue({
				billing_address: {
					...form.getFieldValue('shipping_address'),
				},
			});
		}
	};

	return (
		<Form
			form={form}
			layout="vertical"
			initialValues={{ country_code: countryOptions[0]?.value }}
		>
			<Divider />

			{!noTitle && (
				<Title level={3}>
					{type === AddressType.BILLING
						? 'Địa chỉ thanh toán'
						: type === AddressType.SHIPPING
						? 'Địa chỉ giao hàng'
						: 'Địa chỉ'}
				</Title>
			)}

			{type === AddressType.SHIPPING && (
				<Form.Item>
					<Checkbox
						checked={sameAsShipping}
						onChange={(e) => handleSameAsShippingChange(e.target.checked)}
						disabled
					>
						Địa chỉ thanh toán giống địa chỉ giao hàng
					</Checkbox>
				</Form.Item>
			)}

			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						label="Địa chỉ"
						name={[
							type === AddressType.SHIPPING
								? 'shipping_address'
								: 'billing_address',
							'address_1',
						]}
						rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
					>
						<Input
							placeholder="Địa chỉ đường phố, căn hộ, Suite, Đơn vị, v.v."
							className="rounded-none"
							disabled={type === AddressType.BILLING && sameAsShipping}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						label="Xã/Phường"
						name={[
							type === AddressType.SHIPPING
								? 'shipping_address'
								: 'billing_address',
							'address_2',
						]}
						rules={[{ required: true, message: 'Vui lòng chọn xã/phường' }]}
					>
						<Input
							placeholder="Chọn xã/phường"
							disabled={type === AddressType.BILLING && sameAsShipping}
						/>
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						label="Quận/Huyện"
						name={[
							type === AddressType.SHIPPING
								? 'shipping_address'
								: 'billing_address',
							'city',
						]}
						rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
					>
						<Input
							placeholder="Chọn quận/huyện"
							disabled={type === AddressType.BILLING && sameAsShipping}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						label="Tỉnh/Thành phố"
						name={[
							type === AddressType.SHIPPING
								? 'shipping_address'
								: 'billing_address',
							'province',
						]}
						rules={[
							{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' },
						]}
					>
						<Input
							placeholder="Chọn tỉnh/thành phố"
							disabled={type === AddressType.BILLING && sameAsShipping}
						/>
					</Form.Item>
				</Col>
			</Row>
		</Form>
	);
};

export default AddressForm;
