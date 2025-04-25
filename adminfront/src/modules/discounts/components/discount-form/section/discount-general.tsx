import { Discount } from '@medusajs/medusa';
import { useAdminRegions } from 'medusa-react';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useDiscountForm } from '../discount-form-context';
import { Col, Form, Row } from 'antd';
import { CircleAlert, Loader } from 'lucide-react';
import { Select } from '@/components/Select';
import { Input, InputNumber } from '@/components/Input';
import { Text } from '@/components/Typography';
import { Checkbox } from '@/components/Checkbox';
import { TooltipIcon } from '@/components/Tooltip';

type GeneralProps = {
	discount?: Discount;
};

const General: FC<GeneralProps> = ({ discount }) => {
	const initialCurrency = discount?.regions?.[0].currency_code ?? undefined;
	const [fixedRegionCurrency, setFixedRegionCurrency] = useState<
		string | undefined
	>(initialCurrency);

	const { regions: opts, isLoading } = useAdminRegions();
	const { type, form } = useDiscountForm();
	const regions = (Form.useWatch('regions', form) as any) ?? undefined;

	useEffect(() => {
		if ((type === 'fixed' || discount?.rule?.type === 'fixed') && regions) {
			let id: string;

			if (Array.isArray(regions) && regions.length) {
				id = regions[0] as string;
			} else {
				id = regions as string; // if you change from fixed to percentage, unselect and select a region, and then change back to fixed it is possible to make useForm set regions to an object instead of an array
			}

			const reg = opts?.find((r) => r.id === id);
			if (reg) {
				setFixedRegionCurrency(reg.currency.symbol);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type, opts, regions]);

	const regionOptions = useMemo(() => {
		return opts?.map((r) => ({ value: r.id, label: r.name })) || [];
	}, [opts]);

	if (isLoading) {
		return <Loader className="animate-spin" />;
	}

	return (
		<Row gutter={[16, 8]}>
			<Col xs={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="regions"
					label="Chọn khu vực hợp lệ"
					className="mb-0"
					rules={[
						{ required: true, message: 'Phải chọn ít nhất một khu vực.' },
					]}
				>
					<Select
						placeholder="Chọn một quốc gia"
						options={regionOptions}
						allowClear
					/>
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="code"
					label="Mã"
					className="mb-0"
					rules={[{ required: true, message: 'Yêu cầu nhập mã.' }]}
				>
					<Input placeholder="SUMMERSALE10" />
				</Form.Item>
			</Col>
			{(type !== 'free_shipping' ||
				discount?.rule?.type === 'free_shipping') && (
				<Col xs={24} sm={12}>
					<Form.Item
						labelCol={{ span: 24 }}
						name={['rule', 'value']}
						label={
							type === 'fixed' || discount?.rule?.type === 'fixed'
								? 'Số tiền'
								: 'Phần trăm'
						}
						className="mb-0"
						rules={[
							{ required: true, message: 'Yêu cầu nhập giá trị.' },
							{ type: 'number', message: 'Giá trị phải là số.' },
						]}
					>
						{type === 'fixed' || discount?.rule?.type === 'fixed' ? (
							<InputNumber
								// min={1}
								allowClear
								placeholder="30.000"
								prefix={fixedRegionCurrency}
							/>
						) : (
							<InputNumber
								max={100}
								min={1}
								allowClear
								placeholder="10"
								prefix="%"
							/>
						)}
					</Form.Item>
				</Col>
			)}
			<Col xs={24}>
				<Text className="text-gray-500 text-xs">
					Mã mà khách hàng của bạn sẽ nhập trong quy trình thanh toán. Mã này sẽ
					xuất hiện trên hóa đơn của khách hàng. Chỉ chữ in hoa và số.
				</Text>
			</Col>
			<Col xs={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['rule', 'description']}
					label="Mô tả"
					className="mb-0"
					rules={[{ required: true, message: 'Yêu cầu nhập mô tả.' }]}
				>
					<Input placeholder="Khuyến mãi mùa hè 2024..." />
				</Form.Item>
			</Col>
			<Col xs={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="is_dynamic"
					valuePropName="checked"
					className="mb-0"
					initialValue={false}
				>
					<Checkbox>
						{/* <Text className="text-sm"></Text> */}
						<TooltipIcon
							title="Giảm giá mẫu cho phép bạn xác định một bộ quy tắc có thể được sử dụng trong một nhóm các giảm giá. Điều này hữu ích trong các chiến dịch cần tạo mã duy nhất cho từng người dùng, nhưng quy tắc cho tất cả mã duy nhất nên giống nhau."
							icon={<CircleAlert size={16} color="#6b7280" />}
						>
							Đây là một mẫu giảm giá
						</TooltipIcon>
					</Checkbox>
				</Form.Item>
			</Col>
		</Row>
	);
};

export default General;
