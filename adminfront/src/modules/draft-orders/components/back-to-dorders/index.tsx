'use client';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/Button';
import { Flex } from '@/components/Flex';
import { ERoutes } from '@/types/routes';

type Props = {};

const BackToDorders: FC = ({}) => {
	const router = useRouter();
	const handleBackToOrders = () => {
		router.push(ERoutes.DRAFT_ORDERS);
	};
	return (
		<Flex justify="start">
			<Button
				onClick={handleBackToOrders}
				type="text"
				icon={<ArrowLeft size={18} color="rgb(107 114 128)" />}
				className="text-gray-500 text-sm flex items-center"
			>
				Danh sách đơn hàng
			</Button>
		</Flex>
	);
};

export default BackToDorders;
