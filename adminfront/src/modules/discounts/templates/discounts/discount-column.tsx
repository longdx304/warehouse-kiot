import { ActionAbles } from '@/components/Dropdown';
import StatusIndicator from '@/modules/common/components/status-indicator';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Discount } from '@medusajs/medusa';
import { Copy, MonitorX, Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

enum PromotionStatus {
	SCHEDULED = 'SCHEDULED',
	EXPIRED = 'EXPIRED',
	ACTIVE = 'ACTIVE',
	DISABLED = 'DISABLED',
}

type Props = {
	handleEdit: (record: Discount) => void;
	handleChangeStatus: (id: string, status: boolean) => void;
	handleDelete: (id: string) => void;
	handleDuplicate: (record: Discount) => void;
};

const getPromotionAmount = (promotion: Discount) => {
	switch (promotion.rule.type) {
		case 'fixed':
			if (!promotion.regions?.length) {
				return '';
			}
			return formatAmountWithSymbol({
				currency: promotion.regions[0].currency_code,
				amount: promotion.rule.value,
			});
		case 'percentage':
			return `${promotion.rule.value}%`;
		case 'free_shipping':
			return 'Miễn phí vận chuyển';
		default:
			return '';
	}
};

const getPromotionStatus = (promotion: Discount) => {
	if (!promotion.is_disabled) {
		const date = new Date();
		if (new Date(promotion.starts_at) > date) {
			return PromotionStatus.SCHEDULED;
		} else if (
			(promotion.ends_at && new Date(promotion.ends_at) < date) ||
			(promotion.valid_duration &&
				dayjs(date).isAfter(
					dayjs(promotion.starts_at).add(
						dayjs.duration(promotion.valid_duration)
					)
				)) ||
			promotion.usage_count === promotion.usage_limit
		) {
			return PromotionStatus.EXPIRED;
		} else {
			return PromotionStatus.ACTIVE;
		}
	}
	return PromotionStatus.DISABLED;
};

const getPromotionStatusDot = (promotion: Discount) => {
	const status = getPromotionStatus(promotion);
	switch (status) {
		case PromotionStatus.SCHEDULED:
			return <StatusIndicator title={'Đã lên lịch'} variant="warning" />;
		case PromotionStatus.EXPIRED:
			return <StatusIndicator title={'Hết hạn'} variant="danger" />;
		case PromotionStatus.ACTIVE:
			return <StatusIndicator title={'Đang hoạt động'} variant="success" />;
		case PromotionStatus.DISABLED:
			return <StatusIndicator title={'Đã vô hiệu hóa'} variant="default" />;
		default:
			return <StatusIndicator title={'Đã vô hiệu hóa'} variant="default" />;
	}
};

const getUsageCount = (usageCount: number) => {
	switch (true) {
		case usageCount > 9999999:
			return `${Math.floor(usageCount / 1000000)}m`;
		case usageCount > 9999:
			return `${Math.floor(usageCount / 1000)}k`;
		default:
			return usageCount;
	}
};

const discountColumns = ({
	handleEdit,
	handleChangeStatus,
	handleDelete,
	handleDuplicate,
}: Props) => [
	{
		title: 'Code',
		dataIndex: 'code',
		key: 'code',
		fixed: 'left',
		width: 100,
		className: 'text-xs',
		// render: (_: Discount['display_id']) => {
		// 	return `#${_}`;
		// },
	},
	{
		title: 'Mô tả',
		dataIndex: 'rule',
		key: 'description',
		// width: 150,
		className: 'text-xs',
		render: (_: Discount['rule'], record: Discount) => {
			return _.description;
		},
	},
	{
		title: 'Số tiền',
		dataIndex: 'amount',
		key: 'amount',
		// width: 150,
		className: 'text-xs',
		render: (_: any, record: Discount) => {
			return getPromotionAmount(record);
		},
	},
	{
		title: 'Trạng thái',
		dataIndex: 'ends_at',
		key: 'ends_at',
		width: 150,
		className: 'text-xs',
		render: (_: Discount['ends_at'], record: Discount) => {
			return getPromotionStatusDot(record);
		},
	},
	{
		title: 'Số lượng đổi ưu đãi',
		dataIndex: 'usage_count',
		key: 'usage_count',
		// width: 150,
		className: 'text-xs',
		render: (_: Discount['usage_count']) => {
			return getUsageCount(_);
		},
	},
	{
		title: '',
		key: 'action',
		width: 60,
		fixed: 'right',
		className: 'text-xs',
		align: 'center',
		render: (_: any, record: Discount) => {
			const actions = [
				{
					label: 'Chỉnh sửa thông tin',
					icon: <Pencil size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleEdit(record);
					},
				},
				{
					label: (
						<span className="w-full">
							{record.is_disabled ? 'Kích hoạt' : 'Ngừng kích hoạt'}
						</span>
					),
					key: 'stop-publishing',
					icon: <MonitorX size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleChangeStatus(record.id, !record.is_disabled);
					},
				},
				{
					label: 'Sao chép',
					key: 'dulicate',
					icon: <Copy size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleDuplicate(record);
					},
				},
				{
					label: 'Xoá',
					icon: <Trash2 size={20} />,
					onClick: ({ domEvent }: any) => {
						domEvent.stopPropagation();
						handleDelete(record.id);
					},
					danger: true,
				},
			];

			return <ActionAbles actions={actions as any} />;
		},
	},
];

export default discountColumns;
