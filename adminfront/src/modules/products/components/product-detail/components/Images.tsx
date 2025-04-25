'use client';
import { FC } from 'react';
import { Row, Col } from 'antd';
import { Product } from '@medusajs/medusa';

import ImageThumbnail from './ImageThumbnail';
import ImageMedia from './ImageMedia';

type Props = {
	product: Product;
	loadingProduct: boolean;
};

const Images: FC<Props> = ({ product, loadingProduct }) => {
	return (
		<Row gutter={[16, 16]}>
			<Col flex="auto">
				<ImageThumbnail product={product} loadingProduct={loadingProduct} />
			</Col>
			<Col flex="auto">
				<ImageMedia product={product} loadingProduct={loadingProduct} />
			</Col>
		</Row>
	);
};

export default Images;
