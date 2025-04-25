import { Address } from '@medusajs/medusa';
import { isoAlpha2Countries } from './countries';
import { Option } from '@/types/shared';
import { MetadataFormType } from '@/types/common';

type AddressPayload = {
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
	metadata?: MetadataFormType;
};

const mapAddressToForm = (address: Address): AddressPayload => {
	return {
		first_name: address.first_name || '',
		last_name: address.last_name || '',
		company: address.company || null,
		address_1: address.address_1 || '',
		address_2: address.address_2,
		city: address.city || '',
		province: address.province,
		postal_code: address.postal_code || '',
		country_code: {
			label:
				address.country_code && typeof address.country_code === 'string'
					? isoAlpha2Countries[address.country_code.toUpperCase()]
					: '',
			value: address.country_code || '',
		},
		phone: address.phone,
	};
};

export default mapAddressToForm;
