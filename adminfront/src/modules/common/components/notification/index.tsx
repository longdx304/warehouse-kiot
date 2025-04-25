'use client';
import { Badge } from 'antd';
import { Bell, Frown, LoaderCircle } from 'lucide-react';

import { FloatButton } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { usePolling } from '@/lib/providers/polling-provider';
import { Empty } from 'antd';
import BatchJobActivityList from './BatchJobActivityList';

const Notification = ({}) => {
	return (
		<Dropdown
			dropdownRender={(menu) => DropdownRender()}
			trigger={['click']}
			className="hidden lg:block w-[300px] bg-transparent h-[calc(100%-100px)]"
			overlayStyle={{
				backgroundColor: 'transparent',
				width: '300px',
				left: 'auto',
				right: '16px',
				top: '60px',
				height: 'calc(100% - 100px)',
			}}
		>
			<a onClick={(e) => e.preventDefault()} className="">
				<FloatButton
					className="top-3"
					icon={
						<Badge dot>
							<Bell color="black" size={20} />
						</Badge>
					}
					type="default"
					// onClick={onOpen}
				/>
				{/* <Badge dot>
							<Bell color="black" size={20} />
						</Badge> */}
			</a>
		</Dropdown>
	);
};

export default Notification;

const DropdownRender = () => {
	const { batchJobs, hasPollingError, refetch } = usePolling();
	return (
		<div className="bg-white sm:max-h-[calc(100%)] overflow-auto rounded-lg shadow px-2 box-border">
			<div className="flex justify-between items-center p-2 border-b border-gray-200">
				<span className="text-lg font-semibold">Thông báo</span>
			</div>
			<div className="w-full box-border">
				{!hasPollingError ? (
					batchJobs ? (
						<BatchJobActivityList batchJobs={batchJobs} />
					) : (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description="Không có thông báo mới"
						/>
					)
				) : (
					<ErrorActivityDrawer />
				)}
			</div>
		</div>
	);
};

const ErrorActivityDrawer = () => {
	return (
		<div className="flex w-full flex-col items-center justify-center">
			<Frown size={36} color="#d6d6d6" />
			<span className={'font-semibold text-gray-600 mt-4'}>
				{'Ôi không...'}
			</span>
			<span className={'text-gray-600 mt-2 text-center'}>
				{
					'Có lỗi xảy ra khi thử lấy thông báo của bạn - Chúng tôi sẽ tiếp tục thử!'
				}
			</span>

			<div className="mt-4 flex items-center">
				<LoaderCircle size={20} className="animate-spin" />
				<span className="ml-2.5 text-gray-600">{'Đang xử lý...'}</span>
			</div>
		</div>
	);
};
