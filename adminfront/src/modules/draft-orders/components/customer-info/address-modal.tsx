import { SubmitModal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import AddressContactForm from '@/modules/orders/components/common/address-form/address-contact-form';
import AddressLocationForm from '@/modules/orders/components/common/address-form/address-location-form';
import {
	AddressContactFormType,
	AddressLocationFormType,
	AddressType,
} from '@/types/order';
import { isoAlpha2Countries } from '@/utils/countries';
import { Address, AdminPostDraftOrdersReq, Country } from '@medusajs/medusa';
import { Divider, Form, message } from 'antd';
import { useAdminDraftOrder, useAdminUpdateDraftOrder } from 'medusa-react';
import { useEffect } from 'react';

type ShippingAddressPayloadType =
	| AdminPostDraftOrdersReq['shipping_address']
	| Partial<AdminPostDraftOrdersReq['shipping_address']>;

type BillingAddressPayloadType =
	| AdminPostDraftOrdersReq['billing_address']
	| Partial<AdminPostDraftOrdersReq['billing_address']>;

type AddressModalFormType = {
	contact: AddressContactFormType;
	location: AddressLocationFormType;
};

type TVariables = {
	shipping_address?: ShippingAddressPayloadType;
	billing_address?: BillingAddressPayloadType;
};

type AddressModalProps = {
	orderId: string;
	onClose: () => void;
	open: boolean;
	allowedCountries?: Country[];
	address?: Address;
	type: AddressType;
};

const AddressModal = ({
	orderId,
	address,
	allowedCountries = [],
	onClose,
	open,
	type,
}: AddressModalProps) => {
	const [form] = Form.useForm<AddressModalFormType>();
	const updateOrder = useAdminUpdateDraftOrder(orderId);
	const { draft_order } = useAdminDraftOrder(orderId);

	const handleCancelModal = () => {
		form.resetFields();
		onClose();
	};

	const onFinish = (values: AddressModalFormType) => {
		const updateObj: TVariables = {};
		const { contact, location } = values;
		const countryCode =
			typeof location.country_code === 'string'
				? location.country_code
				: location.country_code?.value;

		const payload = {
			...contact,
			...location,
			country_code: countryCode,
		};

		if (type === AddressType.SHIPPING) {
			updateObj.shipping_address = payload as ShippingAddressPayloadType;
		} else {
			updateObj.billing_address = payload as BillingAddressPayloadType;
		}

		updateOrder.mutateAsync(updateObj as any, {
			onSuccess: () => {
				message.success('Cập nhật địa chỉ thành công');
				onClose();
			},
			onError: (error) => {
				message.error(getErrorMessage(error));
			},
		});
	};

	const countryOptions = allowedCountries
		.map((c) => ({ label: c.display_name, value: c.iso_2 }))
		.filter(Boolean);

	useEffect(() => {
		if (open) {
			form.setFieldsValue(getDefaultValues(address));
		}
	}, [address, open, form]);

	return (
		<SubmitModal
			open={open}
			onOk={onClose}
			handleCancel={handleCancelModal}
			form={form}
			width={700}
		>
			<Title level={3} className="text-center">
				{type === AddressType.BILLING
					? 'Địa chỉ thanh toán'
					: 'Địa chỉ giao hàng'}
			</Title>
			<Divider className="my-2" />

			<Form form={form} onFinish={onFinish} className="pt-4">
				<Title level={5}>Liên hệ</Title>
				<AddressContactForm form={form} />

				<Title level={5}>Vị trí</Title>
				<AddressLocationForm form={form} countryOptions={countryOptions} />
			</Form>
		</SubmitModal>
	);
};

const getDefaultValues = (address?: Address): AddressModalFormType => {
	const countryDisplayName = address?.country_code
		? isoAlpha2Countries[
				address.country_code.toUpperCase() as keyof typeof isoAlpha2Countries
		  ]
		: '';

	return {
		contact: {
			first_name: address?.first_name ?? '',
			last_name: address?.last_name ?? '',
			phone: address?.phone ?? '',
			company: address?.company ?? null,
		},
		location: {
			address_1: address?.address_1 ?? '',
			address_2: address?.address_2 ?? null,
			city: address?.city ?? '',
			province: address?.province ?? null,
			country_code: address?.country_code
				? { label: countryDisplayName, value: address.country_code }
				: { label: '', value: '' },
			postal_code: address?.postal_code ?? '',
		},
	};
};

export default AddressModal;
