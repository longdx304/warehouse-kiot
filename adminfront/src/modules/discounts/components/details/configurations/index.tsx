import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Discount } from '@medusajs/medusa';
import { Pencil } from 'lucide-react';
import useDiscountConfigurations from './use-discount-configurations';
import NumberedItem from '../../common/numbered-item';
import EditConfigurations from './edit-configurations';

type Props = {
	discount: Discount;
};

const Configurations = ({ discount }: Props) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const configurations = useDiscountConfigurations(discount);

	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa cấu hình</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
			onClick: onOpen,
		},
	];

	return (
		<Card className="p-4">
			<Flex align="center" justify="space-between" className="flex-wrap mb-6">
				<div className="flex flex-col gap-2">
					<Title level={3}>{'Cấu hình'}</Title>
				</div>
				<Flex
					align="center"
					justify="flex-end"
					gap="6px"
					className="max-[390px]:w-full"
				>
					<ActionAbles actions={actions} />
				</Flex>
			</Flex>
			<div
				style={{
					gridTemplateRows: `repeat(${Math.ceil(
						configurations.length / 2
					)}, minmax(0, 1fr))`,
				}}
				className="gap-y-4 gap-x-4 grid grid-flow-col grid-cols-1 sm:grid-cols-2"
			>
				{configurations.map((setting, i) => (
					<NumberedItem
						key={i}
						title={setting.title}
						index={i + 1}
						description={setting.description}
						actions={setting.actions}
					/>
				))}
			</div>
			{state && (
				<EditConfigurations
					discount={discount}
					onClose={onClose}
					open={state}
				/>
			)}
		</Card>
	);
};

export default Configurations;
