import useIsDesktop from '@/lib/hooks/useIsDesktop';
import {
	StepModal,
	StepModalProvider,
} from '@/lib/providers/stepped-modal-provider';
import { getErrorMessage } from '@/lib/utils';
import { message } from 'antd';
import { useAdminCreateDraftOrder } from 'medusa-react';
import { FC } from 'react';
import { useNewDraftOrderForm } from '../../hooks/use-new-draft-form';
import Items from '../new/items';
import SelectRegion from '../new/select-region';
import ShippingDetails from '../new/shipping-details';
import Summary from '../new/summary';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	setIsSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
};

const DraftOrderModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	setIsSendEmail,
}) => {
	const { mutate } = useAdminCreateDraftOrder();
	const isDesktop = useIsDesktop();
	const {
		form,
		context: { items },
	} = useNewDraftOrderForm();

	const steps = [
		{ title: '', content: <SelectRegion /> },
		{ title: '', content: <ShippingDetails /> },
		{ title: '', content: <Items /> },
		{ title: '', content: <Summary setIsSendEmail={setIsSendEmail} /> },
	];

	const handleFinish = async () => {
		try {
			const values = form.getFieldsValue(true);
			const transformedData = {
				email: values.email,
				items: items.map((i: any) => ({
					quantity: i.quantity,
					...(i.variant_id
						? { variant_id: i.variant_id, unit_price: i.unit_price }
						: { title: i.title, unit_price: i.unit_price }),
				})),
				region_id: values.region,
				shipping_methods: [{ option_id: values.shipping_option }],
				shipping_address: values.shipping_address_id || {
					...values.shipping_address,
					country_code: values.shipping_address?.country_code?.value || 'vn',
				},
				billing_address: values.billing_address_id || {
					...values.billing_address,
					country_code: values.billing_address?.country_code?.value || 'vn',
				},
				customer_id: values.customer_id,
				discounts: values.discount_code
					? [{ code: values.discount_code }]
					: undefined,
			};

			mutate(transformedData as any, {
				onSuccess: () => {
					message.success('Tạo bản nháp đơn hàng thành công');
					form.resetFields();
					handleOk();
				},
				onError: (error) => {
					message.error('Đã xảy ra lỗi khi tạo bản nháp đơn hàng');
					console.log('error', getErrorMessage(error));
				},
			});
		} catch (error) {
			console.log('error catch', error);
		}
	};

	return (
		<StepModalProvider>
			<StepModal
				open={state}
				onCancel={handleCancel}
				title="Tạo bản nháp đơn hàng"
				steps={steps}
				onFinish={handleFinish}
				isMobile={!isDesktop}
			/>
		</StepModalProvider>
	);
};

export default DraftOrderModal;
