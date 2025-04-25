import { FC, useMemo } from 'react';
import { Row, Col, Form } from 'antd';
import { ProductCollection } from '@medusajs/medusa';

import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Select, TreeSelect } from '@/components/Select';
import { Switch } from '@/components/Switch';

interface Props {
	treeCategories: any;
	isEdit?: boolean;
	productCollections: ProductCollection[];
}

const OrganizeForm: FC<Props> = ({
	treeCategories,
	isEdit = false,
	productCollections,
}) => {
	const optionCollection = useMemo(() => {
		return productCollections?.map((collection) => ({
			label: collection.title,
			value: collection.id,
		}));
	}, [productCollections]);
	return (
		<Row gutter={[16, 4]}>
			<Col span={24}>
				<span className="text-gray-500">
					{'Phân loại cho sản phẩm về type, bộ sưu tập, thể loại, thẻ'}
				</span>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['organize', 'type']}
					label="Type:"
				>
					<Select placeholder="Chọn một loại" options={[]} />
				</Form.Item>
			</Col>
			<Col xs={24} sm={12}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['organize', 'collection']}
					label="Bộ sưu tập:"
				>
					<Select
						placeholder="Chọn một bộ sưu tập"
						options={optionCollection}
					/>
				</Form.Item>
			</Col>
			<Col span={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['organize', 'categories']}
					label="Categories:"
				>
					<TreeSelect
						title="Chọn categories"
						treeData={treeCategories}
						dataTestId="categories"
					/>
				</Form.Item>
			</Col>
			<Col span={24}>
				<Form.Item
					labelCol={{ span: 24 }}
					name={['organize', 'tags']}
					label="Thẻ:"
				>
					<Select
						mode="tags"
						placeholder="Nhập tags của sản phẩm"
						style={{ width: '100%' }}
						tokenSeparators={[',']}
					/>
				</Form.Item>
			</Col>
			{!isEdit && (
				<Col span={24}>
					<Form.Item
						name={['organize', 'salesChannels']}
						label="Kênh bán hàng mới"
						initialValue={false}
						className="mb-0"
						colon={false}
					>
						<Switch className="float-right" />
					</Form.Item>
					<div className="text-gray-500 text-xs">{`Sản phẩm này chỉ sẽ có sẵn trên kênh bán hàng mặc định nếu để không được bật đến.`}</div>
				</Col>
			)}
		</Row>
	);
};

export default OrganizeForm;
