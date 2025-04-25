'use client';
import { Col, Row } from 'antd';
import { useAdminProducts } from 'medusa-react';
import BackToGiftCards from '../../components/back-to-gift-cards';
import { Product } from '@medusajs/medusa';
import { Loader } from 'lucide-react';
import { getErrorStatus } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Images from '@/modules/products/components/product-detail/components/Images';
import GeneralInfo from '@/modules/products/components/product-detail/components/GeneralInfo';
import AttributesInfo from '@/modules/products/components/product-detail/components/AttributesInfo';
import DenominationsSection from '../../components/denominations-section';

interface Props {}

export default function GiftCardManage() {
	const router = useRouter();
	const { products, error, isLoading } = useAdminProducts(
		{
			is_giftcard: true,
		},
		{
			keepPreviousData: true,
		}
	);

	const giftCard = products?.[0] as Product | undefined;

	if (!giftCard) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Loader size={20} className="animate-spin" />
			</div>
		);
	}

	if (error) {
		const errorStatus = getErrorStatus(error);

		if (errorStatus) {
			// If the product is not found, redirect to the 404 page
			if (errorStatus.status === 404) {
				router.push('/404');
				return null;
			}
		}

		// Let the error boundary handle the error
		throw error;
	}

	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToGiftCards />
			</Col>
			<Col span={24}>
				<Images product={giftCard!} loadingProduct={isLoading} />
			</Col>
			<Col span={24}>
				<GeneralInfo product={giftCard!} loadingProduct={isLoading} />
			</Col>
			<Col span={24}>
				<DenominationsSection giftCard={giftCard!} loading={isLoading} />
			</Col>
			<Col span={24}>
				<AttributesInfo product={giftCard!} loadingProduct={isLoading} />
			</Col>
		</Row>
	);
}
