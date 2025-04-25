import { FC } from 'react';
import { Product } from '@medusajs/medusa';
import { Row, Col, MenuProps } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Title, Text } from '@/components/Typography';
import { ActionAbles } from '@/components/Dropdown';
import useToggleState from '@/lib/hooks/use-toggle-state';
import AttributeModal from './edit-modals/AttributeModal';

type Props = {
	product: Product;
	loadingProduct: boolean;
};

const AttributesInfo: FC<Props> = ({ product, loadingProduct }) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa thuộc tính</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
			onClick: onOpen,
		},
	];

	const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
		if (key === 'edit') {
			onOpen();
			return;
		}
	};

	return (
		<Card loading={loadingProduct} className="p-4">
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Flex align="center" justify="space-between">
						<Title level={3}>Thuộc tính</Title>
						<ActionAbles actions={actions} onMenuClick={handleMenuClick} />
					</Flex>
				</Col>
				<Col span={24}>
					<Flex vertical gap="8px">
						<Text className="text-base font-semibold">{'Kích thước'}</Text>
					</Flex>
					<Flex vertical gap="8px" className="w-full pt-2">
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Chiều cao'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.height || '-'}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Chiều rộng'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.width || '-'}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Chiều dài'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.length || '-'}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Trọng lượng'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.weight || '-'}
							</Text>
						</Flex>
					</Flex>
					<Flex vertical gap="8px" className='pt-4'>
						<Text className="text-base font-semibold">{'Hải quan'}</Text>
					</Flex>
					<Flex vertical gap="8px" className="w-full pt-2">
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Mã MID'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.mid_code || '-'}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Mã HS'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.hs_code || '-'}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							gap="small"
							className="w-full"
						>
							<Text className="text-sm text-gray-500">{'Nước xuất xứ'}</Text>
							<Text className="text-sm text-gray-500">
								{product?.origin_country || '-'}
							</Text>
						</Flex>
					</Flex>
				</Col>
			</Row>
			<AttributeModal
				state={state}
				handleOk={onClose}
				handleCancel={onClose}
				product={product}
			/>
		</Card>
	);
};

export default AttributesInfo;
