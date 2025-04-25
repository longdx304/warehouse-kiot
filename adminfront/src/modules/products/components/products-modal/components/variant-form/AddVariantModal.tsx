import { FC } from 'react';
import { Form, type FormProps, type CollapseProps } from 'antd';
import { Plus, Minus } from 'lucide-react';

import { Modal } from '@/components/Modal';
import { Collapse } from '@/components/Collapse';
import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import VariantGeneral from './VariantGeneral';
import VariantStock from './VariantStock';
import VariantShipping from './VariantShipping';
import _ from 'lodash';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	form: any;
	field: any;
};

const AddVariantModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	form,
	field,
}) => {
	const options = Form.useWatch('options', form) || undefined;
	const variants = Form.useWatch('variants', form) || undefined;
	const itemsCollapse: CollapseProps['items'] = [
		{
			key: 'general',
			label: (
				<Flex>
					<div>{'Thông tin chung'}</div>
					<div className="text-rose-600 text-xl">{'*'}</div>
				</Flex>
			),
			children: <VariantGeneral form={form} field={field} />,
		},
		{
			key: 'stock_inventory',
			label: 'Hàng tồn kho',
			children: <VariantStock form={form} field={field} />,
		},
		{
			key: 'shipping',
			label: 'Vận chuyển',
			children: <VariantShipping form={form} field={field} />,
		},
	];

	const handleOnOk = () => {
		// Validate options
		const optionsValidate = options
			?.filter((item: any) => item)
			.map((option: any, index: number) => [
				'variants',
				field.name,
				'options',
				index,
				'value',
			]);

		// Validate with form antd
		form
			.validateFields([['variants', field.name, 'title'], ...optionsValidate])
			.then((values: any) => {
				const currentValues = values.variants[field.name];

				// Remove current variant from variants
				const newVariants = _.reject(
					variants,
					(item) =>
						_.isEqual(item.title, currentValues.title) &&
						_.isEqual(item.options, currentValues.options)
				);

				// Find if variant title or options is exist
				const isExistVariantTitle = newVariants.some(
					(item) => item.title === currentValues.title
				);
				// Find if variant options is exist
				const isExistVariantOptions = newVariants.some((item) =>
					_.isEqual(item.options, currentValues.options)
				);
				// If variant title or options is exist, show error
				if (isExistVariantTitle || isExistVariantOptions) {
					isExistVariantTitle &&
						form.setFields([
							{
								name: ['variants', field.name, 'title'],
								errors: ['Tên phiên bản đã tồn tại.'],
							},
						]);
					isExistVariantOptions &&
						form.setFields(
							optionsValidate.map((option: any) => ({
								name: option,
								errors: ['Một phiên bản với những tuỳ chọn này đã tồn tại.'],
							}))
						);
					return;
				}
				handleOk();
			});
	};

	return (
		<Modal
			open={state}
			handleOk={handleOnOk}
			confirmLoading={false}
			handleCancel={handleCancel}
			width={600}
			// form={form}
		>
			<Title level={3} className="text-center">
				{'Tạo phiên bản'}
			</Title>
			<Collapse
				className="bg-white [&_.ant-collapse-header]:px-0 [&_.ant-collapse-header]:py-4 [&_.ant-collapse-header]:text-base [&_.ant-collapse-header]:font-medium"
				defaultActiveKey={['general']}
				items={itemsCollapse}
				expandIconPosition="end"
				bordered={false}
				expandIcon={({ isActive }) =>
					isActive ? <Minus size={20} /> : <Plus size={20} />
				}
			/>
		</Modal>
	);
};

export default AddVariantModal;
