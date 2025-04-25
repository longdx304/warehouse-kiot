import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { PriceList } from '@medusajs/medusa';
import { Form, FormProps, message } from 'antd';
import { useAdminUpdatePriceList } from 'medusa-react';
import { FC, useEffect } from 'react';
import PriceListType from './price-list-type';
import PriceListGeneral from './price-list-general';
import PriceListCustomerGroups from './price-list-cus-groups';
import { DetailFormType } from '@/types/price';
import { getErrorMessage } from '@/lib/utils';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	priceList: PriceList;
};

const PriceDetailModal: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	priceList,
}) => {
	const [form] = Form.useForm();
	const updatePriceList = useAdminUpdatePriceList(priceList.id);

	useEffect(() => {
		form.setFieldsValue({
			type: { value: priceList.type },
			general: {
				name: priceList.name,
				description: priceList.description,
			},
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [priceList]);

	const onFinish: FormProps<DetailFormType>['onFinish'] = async (values) => {
		const { type, general, dates, customer_groups } = values;
		await updatePriceList.mutateAsync(
			{
				name: general?.name,
				description: general?.description,
				type: type.value as any,
				starts_at: dates?.starts_at ? new Date(dates?.starts_at) : undefined,
				ends_at: dates?.ends_at ? new Date(dates?.ends_at) : undefined,
				customer_groups:
					customer_groups?.ids?.map((item) => ({
						id: item,
					})) || undefined,
			},
			{
				onSuccess: () => {
					handleOk();
					message.success('Cập nhật định giá thành công');
				},
				onError: (error) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};
	return (
		<SubmitModal
			open={state}
			onOk={handleOk}
			handleCancel={handleCancel}
			isLoading={updatePriceList.isLoading}
			width={800}
			form={form}
		>
			<Title level={3} className="text-center">
				Chỉnh sửa thông tin định giá
			</Title>

			<Form form={form} onFinish={onFinish} className="px-4">
				<PriceListType />
				<PriceListGeneral form={form} priceList={priceList} />
				<PriceListCustomerGroups form={form} priceList={priceList} />
			</Form>
		</SubmitModal>
	);
};

export default PriceDetailModal;
