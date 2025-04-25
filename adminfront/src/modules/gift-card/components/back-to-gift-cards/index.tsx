'use client';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { ERoutes } from '@/types/routes';

type Props = {};

const BackToGiftCards: FC = () => {
	const router = useRouter();
	const handleBackToList = () => {
		router.push(`${ERoutes.GIFT_CARDS}`);
	};
	return (
		<Flex justify="start">
			<Button
				onClick={handleBackToList}
				type="text"
				icon={<ArrowLeft size={18} color="rgb(107 114 128)" />}
				className="text-gray-500 text-sm flex items-center"
			>
				Quay lại thẻ quà tặng
			</Button>
		</Flex>
	);
};

export default BackToGiftCards;
