import { CollapseProps } from 'antd';
import { Flex } from '@/components/Flex';
import { Collapse } from '@/components/Collapse';
import { CircleAlert, Minus, Plus } from 'lucide-react';
import { TooltipIcon } from '@/components/Tooltip';
import DiscountType from './section/discount-type';
import General from './section/discount-general';
import Settings from './section/configration';
import DiscountNewConditions from './section/condition';

type DiscountFormProps = {
	closeForm: () => void;
};

const ExpandIcon = ({ isActive }: { isActive: boolean }) =>
	isActive ? <Minus size={20} /> : <Plus size={20} />;

const DiscoutForm = ({ closeForm }: DiscountFormProps) => {
	const itemsCollapse: CollapseProps['items'] = [
		{
			key: 'promotion-type',
			label: (
				<Flex>
					<div>{'Loại giảm giá'}</div>
					<div className="text-rose-600 text-xl mr-1">{'*'}</div>
					<TooltipIcon
						title="Chọn một loại giảm giá"
						icon={<CircleAlert size={16} />}
					/>
				</Flex>
			),
			children: <DiscountType />,
		},
		{
			key: 'general',
			label: (
				<Flex>
					<div>{'Chung'}</div>
					<div className="text-rose-600 text-xl">{'*'}</div>
				</Flex>
			),
			children: <General />,
		},
		{
			key: 'configuration',
			label: 'Cấu hình',
			children: <Settings />,
		},
		{
			key: 'condition',
			label: (
				<Flex>
					<div className="mr-1">{'Điều kiện'}</div>
					<TooltipIcon
						title="Thêm điều kiện giảm giá của bạn"
						icon={<CircleAlert size={16} />}
					/>
				</Flex>
			),
			children: <DiscountNewConditions closeForm={closeForm} />,
		},
	];
	return (
		<Collapse
			className="bg-white [&_.ant-collapse-header]:px-0 [&_.ant-collapse-header]:text-base [&_.ant-collapse-header]:font-medium"
			defaultActiveKey={['promotion-type']}
			items={itemsCollapse}
			expandIconPosition="end"
			bordered={false}
			expandIcon={ExpandIcon as any}
		/>
	);
};

export default DiscoutForm;
