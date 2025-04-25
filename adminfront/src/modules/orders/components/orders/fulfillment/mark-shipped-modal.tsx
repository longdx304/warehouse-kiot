// @ts-nocheck
import { Fulfillment } from '@medusajs/medusa';
import {
	useAdminCreateClaimShipment,
	useAdminCreateShipment,
	useAdminCreateSwapShipment,
} from 'medusa-react';
import React from 'react';
import { Form, message } from 'antd';
import { X } from 'lucide-react';

import { getErrorMessage } from '@/lib/utils';
import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

type MarkShippedModalProps = {
	orderId: string;
	fulfillment: Fulfillment;
	handleCancel: () => void;
	state: boolean;
};

type MarkShippedFormData = {
	tracking_numbers: string[];
};

const MarkShippedModal: React.FC<MarkShippedModalProps> = ({
	orderId,
	fulfillment,
	handleCancel,
	state,
}) => {
	const markOrderShipped = useAdminCreateShipment(orderId);
  const markSwapShipped = useAdminCreateSwapShipment(orderId);
  const markClaimShipped = useAdminCreateClaimShipment(orderId);
	const isSubmitting =
    markOrderShipped.isLoading ||
    markSwapShipped.isLoading ||
    markClaimShipped.isLoading;

	const [form] = Form.useForm();
	const trackingNumbers = Form.useWatch('tracking_numbers', form);

	const onFinish = async (values: MarkShippedFormData) => {
		const resourceId =
      fulfillment.claim_order_id || fulfillment.swap_id || fulfillment.order_id;
    const [type] = resourceId.split("_");
		const { tracking_numbers } = values;
		
		type actionType =
      | typeof markOrderShipped
      | typeof markSwapShipped
      | typeof markClaimShipped

    let action: actionType = markOrderShipped;
		let successText = "Đánh dấu đơn hàng đã được giao thành công.";
		let requestObj;

		switch (type) {
      case "swap":
        action = markSwapShipped
        requestObj = {
          fulfillment_id: fulfillment.id,
          swap_id: resourceId,
          tracking_numbers,
          no_notification: false,
        }
        successText = "Đánh dấu trao đổi đã được giao thành công.";
        break;

      case "claim":
        action = markClaimShipped
        requestObj = {
          fulfillment_id: fulfillment.id,
          claim_id: resourceId,
          tracking_numbers,
        }
        successText ="Đánh dấu đòi lại đã được giao thành công.";
        break;

      default:
        requestObj = {
          fulfillment_id: fulfillment.id,
          tracking_numbers,
          no_notification: false,
        }
        break;
    }

		await action.mutateAsync(requestObj as any, {
      onSuccess: () => {
        message.success(successText);
				form.resetFields();
        handleCancel();
      },
      onError: (err) =>
        message.error(getErrorMessage(err)),
    })
	};


	return (
		<SubmitModal
			open={state}
			isLoading={isSubmitting}
			handleCancel={handleCancel}
			form={form}
		>
			<Title level={3} className="text-center">
				{'Đánh dấu thực hiện đã giao'}
			</Title>
			<Form form={form} onFinish={onFinish} className="pt-4" initialValues={{ tracking_numbers: [""] }}>
				<Form.List labelCol={{ span: 24 }} label="Số theo dõi" name='tracking_numbers'>
					{(subFields, subOpt) => (
						<>
							{subFields.map((subField, index) => (
								<div
									key={subField.key}
									className="flex gap-1 items-center pb-4"
								>
									<Form.Item
										name={[subField.name]}
										className="w-full mb-0"
										// rules={[
										// 	{
										// 		required: true,
										// 		message: 'Vui lòng nhập số theo dõi',
										// 	},
										// ]}
									>
										<Input
											placeholder="Số theo dõi..."
											suffix={
												index > 0 ? <X
													className="cursor-pointer text-gray-500"
													size={12}
													onClick={() => {
														subOpt.remove(subField.name);
													}}
												/> : null
											}
										/>
									</Form.Item>
								</div>
							))}
							<Button
								type="dashed"
								onClick={() => subOpt.add()}
								block
								className="mt-0"
								disabled={trackingNumbers?.some((item: any) => !item)}
							>
								+ Thêm số theo dõi bổ sung
							</Button>
						</>
					)}
				</Form.List>
			</Form>
		</SubmitModal>
	);
};

export default MarkShippedModal;
