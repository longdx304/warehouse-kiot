import { ActionAbles } from '@/components/Dropdown';
import { Tag } from '@/components/Tag';
import { Text } from '@/components/Typography';
import { useObserveWidth } from '@/lib/hooks/use-observe-width';
import StatusIndicator from '@/modules/common/components/status-indicator';
import {
	displayAmount,
	formatAmountWithSymbol,
	normalizeAmount,
} from '@/utils/prices';
import { EditIcon, MonitorCheck, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';

type GiftCardVariant = {
	prices: {
		currency_code: string;
		amount: number;
	}[];
};

type GiftCardBannerProps = {
	title: string;
	status: string;
	thumbnail: string | null;
	description: string | null;
	variants: GiftCardVariant[];
	defaultCurrency: string;
	onEdit: () => void;
	onUnpublish: () => void;
	onDelete: () => void;
};

const GiftCardBanner = ({
	title,
	status,
	thumbnail,
	description,
	variants,
	defaultCurrency,
	onEdit,
	onUnpublish,
	onDelete,
}: GiftCardBannerProps) => {
	const denominations = useMemo(() => {
		return variants
			.map((variant) => {
				const price = variant.prices.find(
					(price) => price.currency_code === defaultCurrency
				);

				if (!price) {
					return '';
				}

				return `${formatAmountWithSymbol({
					currency: defaultCurrency,
					amount: price.amount,
				})}`;
			})
			.filter(Boolean);
	}, [variants, defaultCurrency]);

	const actions: any[] = [
		{
			label: 'Chỉnh sửa',
			onClick: onEdit,
			icon: <EditIcon size={16} />,
		},
		{
			label: status === 'published' ? 'Ngừng kích hoạt' : 'Kích hoạt',
			onClick: onUnpublish,
			icon: <MonitorCheck size={16} />,
		},
		{
			label: 'Xóa',
			onClick: onDelete,
			icon: <TrashIcon size={16} />,
			danger: true,
		},
	];

	return (
		<div className="flex flex-col gap-2">
			<div className="rounded-xl h-full border-gray-20 p-base w-full border flex items-start justify-between">
				<div className="gap-4 flex items-start">
					{thumbnail && (
						<div className="rounded-lg h-[72px] min-h-[72px] w-[72px] min-w-[72px] overflow-hidden">
							<Image
								src={thumbnail}
								alt="Thumbnail"
								height={72}
								width={72}
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					<div className="w-full">
						<div className="flex flex-col">
							<Text className="font-semibold">{title}</Text>
							<Text className="font-normal text-gray-500 mb-2">
								{description}
							</Text>
							{/* <div className="flex gap-2">
								{denominations?.map((denomination: string, index: number) => (
									<Text
										className="font-normal bg-gray-300 w-fit px-2 py-1 rounded-lg flex items-center"
										key={index}
									>
										{denomination}
									</Text>
								))}
							</div> */}
							<TagGrid tags={denominations} />
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end h-full gap-4">
					<StatusIndicator
						variant={status === 'published' ? 'success' : 'danger'}
						title={status === 'published' ? 'Kích hoạt' : 'Đã tắt'}
					/>
					<ActionAbles actions={actions} />
				</div>
			</div>
		</div>
	);
};

export default GiftCardBanner;

type TagGridProps = {
	tags: string[];
};

const TagGrid = ({ tags }: TagGridProps) => {
	const containerRef = useRef(null);
	const width = useObserveWidth(containerRef);
	const columns = Math.max(Math.floor(width / 70) - 1, 1);
	const visibleTags = tags.slice(0, columns);
	const remainder = tags.length - columns;

	return (
		<div className="flex w-1/2 items-center" ref={containerRef}>
			{visibleTags?.map((tag, index) => {
				return (
					<Tag className="" key={index}>
						{tag}
					</Tag>
				);
			})}
			{remainder > 0 && <Tag>+{remainder}</Tag>}
		</div>
	);
};
