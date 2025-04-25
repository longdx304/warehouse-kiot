import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Select } from '@/components/Select';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import { ERoutes } from '@/types/routes';
import { formatAmountWithSymbol } from '@/utils/prices';
import { Discount } from '@medusajs/medusa';
import { message, Modal } from 'antd';
import { Dot, Pencil, TrashIcon } from 'lucide-react';
import { useAdminDeleteDiscount, useAdminUpdateDiscount } from 'medusa-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditGeneral from './edit-general';

type Props = {
	discount: Discount;
};

const General = ({ discount }: Props) => {
	const router = useRouter();
	const updateDiscount = useAdminUpdateDiscount(discount.id);
	const deletediscount = useAdminDeleteDiscount(discount.id);

	const { state, onOpen, onClose } = useToggleState(false);

	const onChangeStatus = () => {
		updateDiscount.mutate(
			{
				is_disabled: !discount.is_disabled,
			},
			{
				onSuccess: ({ discount: { is_disabled } }) => {
					message.success(
						!is_disabled
							? 'Đã kích hoạt mã giảm giá'
							: 'Đã chuyển mã giảm giá sang bản nháp'
					);
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const handleDeleteDiscount = () => {
		Modal.confirm({
			title: 'Xóa mã giảm giá',
			content: 'Bạn có chắc chắn muốn xóa mã giảm giá này?',
			okText: 'Xóa',
			okType: 'danger',
			onOk: () => {
				deletediscount.mutate(undefined, {
					onSuccess: () => {
						message.success('Xóa mã giảm giá thành công');
						router.push(ERoutes.DISCOUNTS);
					},
					onError: (err) => {
						message.error(getErrorMessage(err));
					},
				});
			},
		});
	};

	const actions = [
		{
			label: <span className="w-full">Chỉnh sửa thông tin</span>,
			key: 'edit',
			icon: <Pencil size={20} />,
			onClick: onOpen,
		},
		{
			label: <span className="w-full">Xóa mã giảm giá</span>,
			key: 'delete',
			icon: <TrashIcon size={20} />,
			danger: true,
			onClick: handleDeleteDiscount,
		},
	];

	return (
		<Card className="p-4">
			<Flex align="center" justify="space-between" className="flex-wrap mb-6">
				<div className="flex flex-col gap-2">
					<Title level={3}>{discount?.code}</Title>
					<Text className="text-sm text-gray-500">
						{discount.rule.description}
					</Text>
				</div>
				<Flex
					align="center"
					justify="flex-end"
					gap="6px"
					className="max-[390px]:w-full"
				>
					<Select
						value={discount?.is_disabled ? 'draft' : 'published'}
						suffixIcon={null}
						variant="borderless"
						className="w-[140px] hover:bg-gray-200 rounded-md"
						onChange={onChangeStatus}
						options={[
							{
								value: 'published',
								label: (
									<Flex justify="flex-start" align="center" gap="2px">
										<Dot
											color="rgb(52 211 153)"
											size={20}
											className="w-[20px]"
										/>
										<Text>{'Đang hoạt động'}</Text>
									</Flex>
								),
							},
							{
								value: 'draft',
								label: (
									<Flex justify="flex-start" align="center" gap="2px">
										<Dot
											color="rgb(156 163 175)"
											size={20}
											className="w-[20px]"
										/>
										<Text>{'Bản nháp'}</Text>
									</Flex>
								),
							},
						]}
					/>
					<ActionAbles actions={actions} />
				</Flex>
			</Flex>
			<DiscountDetail discount={discount} />
			{state && (
				<EditGeneral discount={discount} onClose={onClose} open={state} />
			)}
		</Card>
	);
};

export default General;

const DiscountDetail = ({ discount }: Props) => {
	return (
		<div className="flex flex-col gap-1">
			<Flex
				align="center"
				justify="space-between"
				gap="small"
				className="w-full"
			>
				<Text className="text-sm text-gray-500">Số tiền giảm giá</Text>
				<Text className="text-sm text-gray-500">
					{getPromotionDescription(discount)}
				</Text>
			</Flex>
			<Flex
				align="center"
				justify="space-between"
				gap="small"
				className="w-full"
			>
				<Text className="text-sm text-gray-500">Các khu vực hợp lệ</Text>
				<Text className="text-sm text-gray-500">
					{discount.regions.length.toLocaleString('en-US')}
				</Text>
			</Flex>
			<Flex
				align="center"
				justify="space-between"
				gap="small"
				className="w-full"
			>
				<Text className="text-sm text-gray-500">Tổng số lần đổi</Text>
				<Text className="text-sm text-gray-500">
					{discount.usage_count.toLocaleString('en-US')}
				</Text>
			</Flex>
		</div>
	);
};

const getPromotionDescription = (discount: Discount) => {
	switch (discount.rule.type) {
		case 'fixed':
			return (
				<div className="flex items-center">
					<Text strong className="font-normal text-lg">
						{formatAmountWithSymbol({
							currency: discount.regions[0].currency_code,
							amount: discount.rule.value,
						})}
					</Text>
					{/* <span className="inter-base-regular text-grey-50 ml-1">
						{discount.regions[0].currency_code.toUpperCase()}
					</span> */}
				</div>
			);
		case 'percentage':
			return (
				<div className="flex items-center">
					<Text strong className="text-gray-900">
						{discount.rule.value}
					</Text>
					<span className="inter-base-regular text-grey-50 ml-1">%</span>
				</div>
			);
		case 'free_shipping':
			return (
				<Text strong className="text-gray-900">
					Miễn phí vận chuyển
				</Text>
			);
		default:
			return 'Loại giảm giá không rõ';
	}
};
