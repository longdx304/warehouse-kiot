import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Tag } from '@/components/Tag';
import { Text } from '@/components/Typography';
import { useUser } from '@/lib/providers/user-provider';
import { FulfillSupplierOrderStt, SupplierOrder } from '@/types/supplier';
import dayjs from 'dayjs';
import { Check, Clock } from 'lucide-react';

type InboundItemProps = {
	item: SupplierOrder;
	handleConfirm: (item: SupplierOrder) => void;
	handleClickDetail: (item: SupplierOrder) => void;
	handleRemoveHandler: (item: SupplierOrder) => void;
};

const InboundItem: React.FC<InboundItemProps> = ({
	item,
	handleClickDetail,
	handleConfirm,
	handleRemoveHandler,
}) => {
	const { user } = useUser();
	const isProcessing =
		item.fulfillment_status === FulfillSupplierOrderStt.DELIVERED;

	const isStart = isProcessing && !item?.handler_id;

	const actions = [
		{
			label: <span className="w-full">{'Thực hiện'}</span>,
			key: 'handle',
			disabled: !isStart,
			onClick: () => handleConfirm(item),
		},
		{
			label: <span className="w-full">{'Huỷ bỏ'}</span>,
			key: 'remove',
			disabled: user?.id !== item?.handler_id || isStart || !isProcessing,
			danger: true,
			onClick: () => handleRemoveHandler(item),
		},
	];

	return (
		<Card className="bg-[#F3F6FF]" rounded>
			<Tag
				color={isProcessing ? 'gold' : 'green'}
				className="w-fit flex items-center gap-1 p-2 rounded-lg"
			>
				<span className="text-[14px] font-semibold">
					{isStart
						? 'Chờ xử lý'
						: isProcessing
						? 'Đang tiến hành'
						: 'Đã hoàn thành'}
				</span>
				{isProcessing ? <Clock size={16} /> : <Check />}
			</Tag>
			<Flex gap={4} className="pt-2" align="center">
				<Text className="text-[14px] text-gray-500">Mã đơn hàng:</Text>
				<Text className="text-sm font-semibold">{`#${item.display_id}`}</Text>
			</Flex>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Ngày nhập hàng:</Text>
				<Text className="text-sm font-semibold">
					{dayjs(item.created_at).format('DD/MM/YYYY')}
				</Text>
			</Flex>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Người xử lý:</Text>
				<Text className="text-sm font-semibold">
					{item?.handler_id
						? `${item.handler?.last_name ?? ''} ${item.handler?.first_name ?? ''}`
						: 'Chưa xác định'}
				</Text>
			</Flex>
			<Flex gap={4} align="center" justify="space-between" className="mt-2">
				<Button className="w-full" onClick={() => handleClickDetail(item)}>
					{user?.id === item?.handler_id ? 'Nhập kho' : 'Chi tiết'}
				</Button>
				<ActionAbles actions={actions as any} />
			</Flex>
		</Card>
	);
};

export default InboundItem;
