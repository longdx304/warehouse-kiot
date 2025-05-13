import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Tag } from '@/components/Tag';
import { Text } from '@/components/Typography';
import { useUser } from '@/lib/providers/user-provider';
import { StockOutStatus, StockOut, FulfillmentStatus } from '@/types/order';
import dayjs from 'dayjs';
import { Check, Clock } from 'lucide-react';

type OutboundItemProps = {
	item: StockOut;
	handleClickDetail: (item: StockOut) => void;
	handleConfirm: (item: StockOut) => void;
	handleRemoveHandler: (item: StockOut) => void;
};

const OutboundItem: React.FC<OutboundItemProps> = ({
	item,
	handleClickDetail,
	handleConfirm,
	handleRemoveHandler,
}) => {
	const { user } = useUser();

	// const isProcessing = item.statusValue === StockOutStatus.NOT_SHIPPED;

	// const isStart = isProcessing && !item?.retailerId;

	const actions = [
		{
			label: <span className="w-full">{'Thực hiện'}</span>,
			key: 'handle',
			// disabled: !isStart,
			onClick: () => handleConfirm(item),
		},
		{
			label: <span className="w-full">{'Huỷ bỏ'}</span>,
			key: 'remove',
			// disabled: user?.id !== item?.retailerId || isStart || !isProcessing,
			danger: true,
			onClick: () => handleRemoveHandler(item),
		},
	];

	return (
		<Card className="bg-[#F3F6FF]" rounded>
			<Tag
				// color={isProcessing ? 'gold' : 'green'}
				color={item.statusValue === StockOutStatus.NOT_SHIPPED ? 'gold' : 'green'}
				className="w-fit flex items-center gap-1 p-2 rounded-lg mb-2"
			>
				<span className="text-[14px] font-semibold">
					{item.statusValue === StockOutStatus.NOT_SHIPPED
						? 'Chờ xử lý'
						: item.statusValue === StockOutStatus.SHIPPING
						? 'Đang tiến hành'
						: item.statusValue === StockOutStatus.RETURNING
						? 'Đang chuyển hoàn'
						: item.statusValue === StockOutStatus.RETURNED
						? 'Đã chuyển hoàn'
						: 'Đã hoàn thành'}
				</span>
				{item.statusValue === StockOutStatus.NOT_SHIPPED ? <Clock size={16} /> : <Check />}
			</Tag>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Mã đơn hàng:</Text>
				<Text className="text-sm font-semibold">{`${item.code}`}</Text>
			</Flex>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Người đặt hàng:</Text>
				<Text className="text-sm font-semibold text-wrap">{`${
					item.customerName || ''
				}`}</Text>
			</Flex>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Ngày đặt hàng:</Text>
				<Text className="text-sm font-semibold">
					{dayjs(item.createdDate).format('DD/MM/YYYY')}
				</Text>
			</Flex>
			<Flex gap={4} className="" align="center">
				<Text className="text-[14px] text-gray-500">Người bán hàng:</Text>
				<Text className="text-sm font-semibold">
					{item?.soldByName ? `${item.soldByName}` : 'Chưa xác định'}
				</Text>
			</Flex>
			<Flex gap={4} align="center" justify="space-between" className="mt-2">
				<Button className="w-full" onClick={() => handleClickDetail(item)}>
					{user?.id === item?.retailerId ? 'Xuất kho' : 'Chi tiết'}
				</Button>
				<ActionAbles actions={actions as any} />
			</Flex>
		</Card>
	);
};

export default OutboundItem;
