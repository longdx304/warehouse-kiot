import { formatAmountWithSymbol } from '@/utils/prices';
import { clsx } from 'clsx';

export const DisplayTotal = ({
	totalAmount,
	totalTitle,
	currency,
	variant = 'regular',
	subtitle = '',
	totalColor = 'text-gray-900 mr-3',
}: {
	totalAmount: any;
	totalTitle: any;
	currency: any;
	variant?: any;
	subtitle?: any;
	totalColor?: any;
}) => {
	return (
		<div className="mt-4 flex items-center justify-between text-[12px]">
			<div className="flex flex-col">
				<div
					className={clsx('text-gray-900', {
						'font-normal': variant === 'regular',
						'font-medium': variant === 'large' || variant === 'bold',
					})}
				>
					{totalTitle}
				</div>
				{subtitle && (
					<div className="font-normal text-gray-500 mt-1">{subtitle}</div>
				)}
			</div>
			<DisplayTotalAmount
				totalAmount={Math.round(totalAmount)}
				currency={currency}
				variant={variant}
				totalColor={totalColor}
			/>
		</div>
	);
};

export const DisplayTotalAmount = ({
	totalColor = 'text-gray-900 mr-3',
	variant = 'regular',
	totalAmount,
	currency,
}: any) => {
	return (
		<div className="flex">
			<div
				className={clsx(totalColor, {
					'font-medium': variant === 'bold',
					'font-medium text-[24px]': variant === 'large',
				})}
			>
				{formatAmountWithSymbol({
					amount: totalAmount,
					currency,
				})}
			</div>
			{variant === 'regular' && (
				<div className="font-normal text-gray-500">
					{currency.toUpperCase()}
				</div>
			)}
		</div>
	);
};

export const DisplayTotalQuantity = ({
	totalColor = 'text-gray-900 mr-3',
	variant = 'regular',
	totalAmount,
	quantityTitle,
	productTitle,
	productQuantity,
}: any) => {
	return (
		<>
			<div className="mt-4 flex items-center justify-between text-[12px]">
				<div className="flex flex-col">
					<div
						className={clsx('text-gray-900', {
							'font-normal': variant === 'regular',
							'font-medium': variant === 'large' || variant === 'bold',
						})}
					>
						{productTitle}
					</div>
				</div>
				<div className="font-medium text-[16px]">
					{productQuantity + ' '}(sản phẩm)
				</div>
			</div>
			<div className="mt-4 flex items-center justify-between text-[12px]">
				<div className="flex flex-col">
					<div
						className={clsx('text-gray-900', {
							'font-normal': variant === 'regular',
							'font-medium': variant === 'large' || variant === 'bold',
						})}
					>
						{quantityTitle}
					</div>
				</div>
				<div className="font-medium text-[16px]">{totalAmount + ' '}(đôi)</div>
			</div>
		</>
	);
};
