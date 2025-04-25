import { useMemo } from 'react';
import { Empty } from 'antd';
import { Frown, LoaderCircle } from 'lucide-react';

import BatchJobActivityList from './BatchJobActivityList';
import { usePolling } from '@/lib/providers/polling-provider';

const DropdownRender = () => {
	const { batchJobs, hasPollingError, refetch } = usePolling();
	return (
		<div className="bg-white max-h-[calc(100%-120px)] lg:max-h-[calc(100%-60px)] overflow-y-auto overflow-x-hidden rounded-lg shadow px-2 box-border">
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

export default DropdownRender;

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