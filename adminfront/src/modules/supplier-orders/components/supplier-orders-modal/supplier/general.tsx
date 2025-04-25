import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Switch } from '@/components/Switch';
import { Tooltip } from '@/components/Tooltip';
import { Text } from '@/components/Typography';
import { useUser } from '@/lib/providers/user-provider';
import dayjs from 'dayjs';
import { FC } from 'react';

type GeneralProps = {
	setIsSendEmail: (value: boolean) => void;
};

const General: FC<GeneralProps> = ({ setIsSendEmail }) => {
	const { user } = useUser();

	const handleOnChange = (value: boolean) => {
		setIsSendEmail(value);
	};

	const titleContent = 'Click để xác nhận gửi thông báo đến NCC	với thông tin đơn hàng';
	
	return (
		<Card>
			<Flex className="flex justify-between items-start">
				{/* Left Section */}
				<Flex className="flex-col gap-y-2">
					<Flex className="flex gap-2">
						<Text strong>Ngày đặt hàng:</Text>
						<Text>{dayjs().format('DD/MM/YYYY')}</Text>
					</Flex>
					<Flex className="flex gap-2">
						<Text strong>Nhân viên mua hàng:</Text>
						<Text>
							{user?.first_name} {user?.last_name}
						</Text>
					</Flex>
				</Flex>

				{/* Right Section */}
				<Flex className="flex items-center gap-2">
					<Tooltip title={titleContent}>
						<Text strong>Gửi email:</Text>
					</Tooltip>
					<Switch onChange={handleOnChange} />
				</Flex>
			</Flex>
		</Card>
	);
};

export default General;
