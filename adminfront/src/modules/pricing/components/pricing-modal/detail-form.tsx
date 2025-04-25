import { Flex } from '@/components/Flex';
import { DetailFormType } from '@/types/price';
import { Form, FormProps } from 'antd';
import { FC } from 'react';
import _ from 'lodash';
import { Button } from '@/components/Button';
import PriceListCustomerGroups from '../pricing-detail-modal/price-list-cus-groups';
import PriceListGeneral from '../pricing-detail-modal/price-list-general';
import PriceListType from '../pricing-detail-modal/price-list-type';

type Props = {
	setDetailForm: (data: DetailFormType) => void;
	setCurrentStep: (nextStep: number) => void;
	onCancel: () => void;
};

const DetailForm: FC<Props> = ({ setDetailForm, setCurrentStep, onCancel }) => {
	const [form] = Form.useForm();

	const onFinish: FormProps<DetailFormType>['onFinish'] = (values) => {
		setDetailForm(values);
		setCurrentStep(1);
	};

	return (
		<Form form={form} onFinish={onFinish} className="px-4">
			<PriceListType />
			<PriceListGeneral />
			<PriceListCustomerGroups form={form}  />
			<Flex justify="flex-end" gap="small" className="mt-4">
				<Button type="default" onClick={onCancel}>
					Huỷ
				</Button>
				<Button htmlType="submit" data-testid="add-detail-form">Tiếp theo</Button>
			</Flex>
		</Form>
	);
};

export default DetailForm;