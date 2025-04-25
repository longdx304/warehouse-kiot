import { CreatePricingType } from '@/types/price';
import { useState } from 'react';

const usePriceForm = () => {
	const [formData, setFormData] = useState<CreatePricingType | null>(null);

	return {
		formData,
		setFormData,
	};
};

export default usePriceForm;
