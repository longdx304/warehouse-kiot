'use client';
import { Product } from '@medusajs/medusa';
import { Col, Empty, MenuProps, Row } from 'antd';
import { Images, Pencil } from 'lucide-react';
import { FC } from 'react';

import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Image, ImageGroup } from '@/components/Image';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import MediaModal from './edit-modals/MediaModal';
import VariantImgsModal from './edit-modals/VariantImgsModal';

type Props = {
	product: Product;
	loadingProduct: boolean;
};

const ImageMedia: FC<Props> = ({ product, loadingProduct }) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const {
		state: stateVariantImgs,
		onOpen: onOpenVariantImgs,
		onClose: onCloseVariantImgs,
	} = useToggleState(false);
	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
		},
		{
			label: <span className="w-full">Hình ảnh cho biến thể</span>,
			key: 'variant-images',
			icon: <Images size={20} />,
		},
	];

	const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
		if (key === 'edit') {
			onOpen();
			return;
		}
		if (key === 'variant-images') {
			onOpenVariantImgs();
			return;
		}
	};

	return (
		<Card loading={loadingProduct} className="max-h-[200px]">
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Flex align="center" justify="space-between">
						<Title level={3}>{`Media (${
							product?.images?.length || 0
						} ảnh)`}</Title>
						<ActionAbles actions={actions} onMenuClick={handleMenuClick} />
					</Flex>
				</Col>
				<Col span={24}>
					<Flex
						align="center"
						justify={product?.images?.length ? 'flex-start' : 'center'}
						gap="small"
						className="w-full overflow-x-auto"
					>
						{product?.images?.length ? (
							<ImageGroup>
								{product?.images?.map((image) => (
									<div
										key={image.id}
										className="flex aspect-square items-center justify-center"
									>
										<Image
											src={image?.url}
											alt={`Product Image ${image.id}`}
											width={120}
											height={120}
											className="rounded-md hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
										/>
									</div>
								))}
							</ImageGroup>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="Không có hình ảnh"
							/>
						)}
					</Flex>
				</Col>
			</Row>
			<MediaModal
				state={state}
				handleOk={onClose}
				handleCancel={onClose}
				product={product}
			/>
			<VariantImgsModal
				state={stateVariantImgs}
				handleOk={onCloseVariantImgs}
				handleCancel={onCloseVariantImgs}
				product={product}
			/>
		</Card>
	);
};

export default ImageMedia;
