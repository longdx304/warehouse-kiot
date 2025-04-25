import { Input, InputNumber } from '@/components/Input';
import { SubmitModal } from '@/components/Modal';
import { Text } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import { Region } from '@medusajs/medusa';
import { Col, Form, Row, message } from 'antd';
import { useAdminUpdateRegion, useAdminCreateRegion } from 'medusa-react';
import { FC, useEffect } from 'react';
import { Select } from '@/components/Select';
import { useStoreData } from './use-store-data';
import _ from 'lodash';
import { AdminPostRegionsReq } from '@medusajs/medusa';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	region?: Region;
};

const RegionModal: FC<Props> = ({ state, handleOk, handleCancel, region }) => {
	const [form] = Form.useForm();
	const updateRegion = useAdminUpdateRegion(region?.id || '');
	const createRegion = useAdminCreateRegion();
	const {
		currencyOptions,
		countryOptions,
		fulfillmentProviderOptions,
		paymentProviderOptions,
	} = useStoreData();

	const isCreate = _.isEmpty(region);

	useEffect(() => {
		if (!isCreate && region) {
			form.setFieldsValue({
				name: region?.name,
				countries: region?.countries?.map((country) => country.iso_2),
				currency_code: region?.currency_code,
				fulfillment_providers: region?.fulfillment_providers ? region?.fulfillment_providers.map(
					(fp) => fp.id
				) : [],
				payment_providers: region?.payment_providers ? region?.payment_providers.map((pp) => pp.id) : [],
				tax_rate: region?.tax_rate,
				tax_code: region?.tax_code || undefined,
			});
			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [region]);

	const createPayload = (values: AdminPostRegionsReq) => {
		const payload: AdminPostRegionsReq = {
			name: values.name!,
			countries: values.countries,
			currency_code: values.currency_code,
			fulfillment_providers: values.fulfillment_providers,
			payment_providers: values.payment_providers,
			tax_rate: values.tax_rate!,
			tax_code: values.tax_code || undefined,
		}

		return payload;
	}

	const onFinish = async (values: AdminPostRegionsReq) => {
		const payload = createPayload(values);
		if (isCreate) {
			await createRegion.mutateAsync(payload, {
				onSuccess: () => {
					message.success('Tạo mới khu vực thành công');
					handleOk();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			})
			return;
		}
		if (!isCreate) {
			await updateRegion.mutateAsync(payload, {
				onSuccess: () => {
					message.success('Cập nhật khu vực thành công');
					handleOk();
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			})
			return;
		}
	};

	const parser = (value: any) => {
		return value.replace(/\$\s?|(,*)/g, '');
	};
	const formatter = (value: any) => {
		if (value) {
			return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
		return value;
	};

	return (
		<SubmitModal
			title={isCreate ? 'Tạo mới khu vực' : 'Chỉnh sửa khu vực'}
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={createRegion.isLoading || updateRegion.isLoading}
			form={form}
		>
			<Form form={form} onFinish={onFinish}>
				<Row gutter={[16, 8]} className="pt-4">
					<Col xs={24}>
						<Text strong>Chi tiết</Text>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="name"
							label="Tên"
							rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}
						>
							<Input placeholder="Tên" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="currency_code"
							label="Tiền tệ"
							rules={[
								{ required: true, message: 'Vui lòng chọn một loại tiền tệ' },
							]}
						>
							<Select
								placeholder="Chọn tiền tệ"
								className="w-full"
								options={currencyOptions}
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="tax_rate"
							label="Tỷ lệ thuế mặc định"
							rules={[
								{ required: true, message: 'Vui lòng nhập tỷ lệ thuế' },
								{
									type: 'number',
									message: 'Tỷ lệ thuế phải là số',
								},
							]}
						>
							<InputNumber
								prefix="%"
								className="w-full"
								placeholder="25"
								formatter={formatter}
								parser={parser}
								// size="small"
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="tax_code"
							label="Mã thuế mặc định"
						>
							<Input placeholder="1000" />
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="countries"
							label="Quốc gia"
						>
							<Select
								showSearch
								mode="multiple"
								placeholder="Chọn quốc gia"
								className="w-full"
								options={countryOptions}
								allowClear
								filterOption={(input, option) =>
									(option?.label as string ?? '')
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>
					</Col>
					<Col xs={24}>
						<Text strong>Nhà cung cấp</Text>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="payment_providers"
							label="Nhà cung cấp thanh toán"
							rules={[
								{ required: true, message: 'Vui lòng chọn một nhà cung cấp' },
							]}
						>
							<Select
								showSearch
								mode="multiple"
								placeholder="Chọn nhà cung cấp"
								className="w-full"
								options={paymentProviderOptions}
								allowClear
								filterOption={(input, option) =>
									(option?.label as string ?? '')
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item
							labelCol={{ span: 24 }}
							name="fulfillment_providers"
							label="Nhà cung cấp đáp ứng"
							rules={[
								{ required: true, message: 'Vui lòng chọn một nhà cung cấp' },
							]}
						>
							<Select
								showSearch
								mode="multiple"
								placeholder="Chọn nhà cung cấp"
								className="w-full"
								options={fulfillmentProviderOptions}
								allowClear
								filterOption={(input, option) =>
									(option?.label as string ?? '')
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</SubmitModal>
	);
};

export default RegionModal;
