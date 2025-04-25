'use client';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { ERoutes } from '@/types/routes';

type Props = {};

const BackToDiscounts: FC = () => {
	const router = useRouter();
	const handleBackToDiscounts = () => {
		router.push(ERoutes.DISCOUNTS);
	};
	return (
		<Flex justify="start">
			<Button
				onClick={handleBackToDiscounts}
				type="text"
				icon={<ArrowLeft size={18} color="rgb(107 114 128)" />}
				className="text-gray-500 text-sm flex items-center"
			>
				Quay lại danh sách giảm giá
			</Button>
		</Flex>
	);
};

export default BackToDiscounts;
