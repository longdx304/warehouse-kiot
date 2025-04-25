'use client';
import { Col, Row } from 'antd';
import { useAdminDiscount } from 'medusa-react';
import BackToDiscounts from '../../components/common/back-to-discount';
import { DiscountFormProvider } from '../../components/discount-form/discount-form-context';
import { Loader } from 'lucide-react';
import { getErrorStatus } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ERoutes } from '@/types/routes';
import General from '../../components/details/general';
import Configurations from '../../components/details/configurations';
import Conditions from '../../components/details/conditions';

interface Props {
	id: string;
}

export default function DiscountDetail({ id }: Readonly<Props>) {
	const router = useRouter();
	const { discount, isLoading, error } = useAdminDiscount(
		id!,
		{ expand: 'rule,rule.conditions,regions' },
		{
			enabled: !!id,
		}
	);

	if (error) {
		const errorStatus = getErrorStatus(error);

		if (errorStatus) {
			// If the discount is not found, redirect to the 404 page
			if (errorStatus.status === 404) {
				router.push(ERoutes.DISCOUNTS);
				return null;
			}
		}

		// Let the error boundary handle the error
		throw error;
	}

	if (isLoading || !discount) {
		return (
			<div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
				<Loader className="animate-spin" />
			</div>
		);
	}

	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToDiscounts />
			</Col>
			<Col xs={24} className="flex flex-col gap-y-4">
				<DiscountFormProvider>
					<General discount={discount} />
					<Configurations discount={discount} />
					<Conditions discount={discount} />
				</DiscountFormProvider>
			</Col>
		</Row>
	);
}
