'use client';
import { Col, Row } from 'antd';
import { useAdminProduct } from 'medusa-react';

import AttributesInfo from './components/AttributesInfo';
import BackToProducts from './components/BackToProducts';
import GeneralInfo from './components/GeneralInfo';
import Images from './components/Images';
import VariantsInfo from './components/VariantsInfo';

interface Props {
	id: string;
}

export default function ProductDetail({ id }: Props) {
	const { product, status, error, isLoading } = useAdminProduct(id || '');

	return (
		<Row gutter={[16, 16]} className="mb-12">
			<Col span={24}>
				<BackToProducts />
			</Col>
			<Col span={24}>
				<Images product={product!} loadingProduct={isLoading} />
			</Col>
			<Col span={24}>
				<GeneralInfo product={product!} loadingProduct={isLoading} />
			</Col>
			<Col span={24}>
				<VariantsInfo product={product!} loadingProduct={isLoading} />
			</Col>
			<Col span={24}>
				<AttributesInfo product={product!} loadingProduct={isLoading} />
			</Col>
		</Row>
	);
}
