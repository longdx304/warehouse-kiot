'use client';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Discount } from '@medusajs/medusa';
import { Pencil } from 'lucide-react';
import NumberedItem from '../../common/numbered-item';
import { useDiscountConditions } from './use-discount-conditions';
import { ConditionsProvider } from './conditions-provider';
import AddConditionsModal from './add-conditions-modal';
import EditConditions from './edit-conditions';
type Props = {
	discount: Discount;
};

const Conditions = ({ discount }: Props) => {
	const { state, onOpen, onClose } = useToggleState(false);
	const { conditions, selectedCondition, deSelectCondition } =
		useDiscountConditions(discount);

	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa điều kiện</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
			onClick: onOpen,
		},
	];

	return (
		<ConditionsProvider discount={discount}>
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
				{conditions.length ? (
					<div
						style={{
							gridTemplateRows: `repeat(${Math.ceil(
								conditions?.length / 2
							)}, minmax(0, 1fr))`,
						}}
						className="gap-y-2 gap-x-4 grid grid-flow-col grid-cols-1 sm:grid-cols-2"
					>
						{conditions.map((condition, i) => (
							<NumberedItem
								key={i}
								title={condition.title}
								index={i}
								description={condition.description}
								actions={condition.actions}
							/>
						))}
					</div>
				) : (
					<div className="gap-y-small flex flex-1 flex-col items-center justify-center">
						<span className="inter-base-regular text-grey-50">
							{'Mã giảm giá chưa có điều kiện'}
						</span>
					</div>
				)}
				{state && (
					<AddConditionsModal open={state} onClose={onClose} isDetails />
				)}
				{selectedCondition && (
					<EditConditions
						open={!!selectedCondition}
						condition={selectedCondition}
						discount={discount}
						onClose={() => deSelectCondition()}
					/>
				)}
			</Card>
		</ConditionsProvider>
	);
};

export default Conditions;
