import { getErrorMessage } from '@/lib/utils';
import { removeFalsy } from '@/utils/remove-nullish';
import { Discount } from '@medusajs/medusa';
import { message } from 'antd';
import dayjs from 'dayjs';
import { ClockIcon, TrashIcon } from 'lucide-react';
import { useAdminUpdateDiscount } from 'medusa-react';
import { ReactNode } from 'react';
import { parse } from 'iso8601-duration';

type displaySetting = {
	title: string;
	description: ReactNode;
	actions?: any[];
};

const DisplaySettingsDateDescription = ({ date }: { date: Date }) => (
	<div className="text-gray-500 font-normal flex text-xs">
		{dayjs(date).format('DD/MM/YYYY')}
		<span className="ml-3 flex items-center">
			<ClockIcon size={16} />
			<span className="ml-2">{dayjs(date).format('HH:mm')}</span>
		</span>
	</div>
);

const CommonDescription = ({ text }: { text: string }) => (
	<span className="text-gray-500 font-normal text-xs">{text}</span>
);

const useDiscountConfigurations = (discount: Discount) => {
	const updateDiscount = useAdminUpdateDiscount(discount.id);

	const conditions: displaySetting[] = [];

	conditions.push({
		title: 'Ngày bắt đầu',
		description: <DisplaySettingsDateDescription date={discount.starts_at} />,
	});

	if (discount.ends_at) {
		conditions.push({
			title: 'Ngày kết thúc',
			description: <DisplaySettingsDateDescription date={discount.ends_at} />,
			actions: [
				{
					label: 'Xóa cấu hình',
					icon: <TrashIcon size={20} />,
					danger: true,
					onClick: async () =>
						await updateDiscount.mutateAsync(
							{ ends_at: null },
							{
								onSuccess: () => {
									message.success('Ngày kết thúc đã được xóa');
								},
								onError: (error) => {
									message.error(getErrorMessage(error));
								},
							}
						),
				},
			],
		});
	}
	if (discount.usage_limit) {
		conditions.push({
			title: 'Số lần sử dụng',
			description: (
				<CommonDescription text={discount.usage_limit.toLocaleString('en')} />
			),
			actions: [
				{
					label: 'Xóa cấu hình',
					icon: <TrashIcon size={20} />,
					danger: true,
					onClick: async () =>
						await updateDiscount.mutateAsync(
							{ usage_limit: null },
							{
								onSuccess: () => {
									message.success('Số lần sử dụng đã được xóa');
								},
								onError: (error) => {
									message.error(getErrorMessage(error));
								},
							}
						),
				},
			],
		});
	}
	if (discount.valid_duration) {
		conditions.push({
			title: 'Thời gian hiệu lực',
			description: (
				<CommonDescription
					text={Object.entries(
						removeFalsy(parse(discount.valid_duration) as any)
					)
						.map(([key, value]) => `${value} ${key}`)
						.join(', ')}
				/>
			),
			actions: [
				{
					label: 'Xóa cấu hình',
					icon: <TrashIcon size={20} />,
					danger: true,
					onClick: async () =>
						await updateDiscount.mutateAsync(
							{ valid_duration: null },
							{
								onSuccess: () => {
									message.success('Duration đã được xóa');
								},
								onError: (error) => {
									message.error(getErrorMessage(error));
								},
							}
						),
				},
			],
		});
	}

	return conditions;
};

export default useDiscountConfigurations;
