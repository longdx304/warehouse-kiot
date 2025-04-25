// @ts-nocheck
'use client';
import { BatchJob } from '@medusajs/medusa/dist';
import { notification } from 'antd';
import { Bell, CircleX, FileBox, LoaderCircle } from 'lucide-react';
import {
	useAdminBatchJob,
	useAdminCancelBatchJob,
	useAdminCreatePresignedDownloadUrl,
	useAdminDeleteFile,
	useAdminStore,
} from 'medusa-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

import { Button } from '@/components/Button';
import { bytesConverter, cn, getErrorMessage } from '@/lib/utils';
import ActivityCard from '@/modules/common/components/activity-card';
import BatchJobFileCard from '@/modules/common/components/batch-job-file-card';
import getRelativeTime from '@/utils/get-relative-time';
import { batchJobDescriptionBuilder } from './utils';

/**
 * Retrieve a batch job and refresh the data depending on the last batch job status
 */
function useBatchJob(initialData: BatchJob): BatchJob {
	const [batchJob, setBatchJob] = useState<BatchJob>(initialData);

	const status = batchJob?.status || initialData.status;

	const refetchInterval = {
		['created']: 2000,
		['pre_processed']: 2000,
		['confirmed']: 2000,
		['processing']: 5000,
		['completed']: false,
		['canceled']: false,
		['failed']: false,
	}[status];

	const { batch_job } = useAdminBatchJob(initialData.id, {
		refetchInterval,
		initialData: { batch_job: initialData },
	});

	useEffect(() => {
		setBatchJob(batch_job);
	}, [batch_job]);

	return useMemo(
		() =>
			new Date(initialData.updated_at) > new Date(batch_job.updated_at)
				? initialData
				: batchJob,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[initialData.updated_at, batchJob?.updated_at]
	);
}

const BatchJobActivityList = ({ batchJobs }: { batchJobs?: BatchJob[] }) => {
	return (
		<div>
			{batchJobs?.map((batchJob) => {
				return <BatchJobActivityCard key={batchJob.id} batchJob={batchJob} />;
			})}
		</div>
	);
};

const BatchJobActivityCard = (props: { batchJob: BatchJob }) => {
	const activityCardRef = useRef<HTMLDivElement>(null);
	const { store } = useAdminStore();

	const batchJob = useBatchJob(props.batchJob);

	const { mutate: cancelBatchJob, error: cancelBatchJobError } =
		useAdminCancelBatchJob(batchJob.id);
	const { mutateAsync: deleteFile } = useAdminDeleteFile();
	const { mutateAsync: createPresignedUrl } =
		useAdminCreatePresignedDownloadUrl();

	const fileName =
		batchJob.result?.file_key?.split('/').pop() ?? `${batchJob.type}.csv`;
	const relativeTimeElapsed = getRelativeTime({
		from: new Date(),
		to: batchJob.created_at,
	});

	let operation = batchJob.type.split('-').pop();
	operation = operation.charAt(0).toUpperCase() + operation.slice(1);

	const batchJobActivityDescription = batchJobDescriptionBuilder(
		batchJob,
		operation,
		relativeTimeElapsed.raw
	);

	const canCancel =
		batchJob.status !== 'completed' &&
		batchJob.status !== 'failed' &&
		batchJob.status !== 'canceled';

	const hasError = batchJob.status === 'failed';

	const canDownload =
		batchJob.status === 'completed' && batchJob.result?.file_key;

	useEffect(() => {
		if (cancelBatchJobError) {
			notification.error({
				description: getErrorMessage(cancelBatchJobError),
			});
		}
	}, [cancelBatchJobError]);

	const onDownloadFile = async () => {
		if (!batchJob.result?.file_key) {
			return;
		}

		try {
			const { download_url } = await createPresignedUrl({
				file_key: batchJob.result?.file_key,
			});
			// Tạo một request để kiểm tra nội dung tệp
			const response = await fetch(download_url);
			const blob = await response.blob();

			// Đảm bảo mã hóa UTF-8
			const reader = new FileReader();
			reader.onload = () => {
				const csvText = reader.result;

				// Chuyển đổi CSV thành workbook
				const workbook = XLSX.read(csvText, { type: 'string' });

				// Chuyển đổi workbook thành tệp Blob
				const wopts = { bookType: 'xlsx', type: 'array' };
				const xlsxBlob = new Blob([XLSX.write(workbook, wopts)], {
					type: 'application/octet-stream',
				});

				// Tạo và kích hoạt link tải xuống cho tệp XLSX
				const link = document.createElement('a');
				link.href = URL.createObjectURL(xlsxBlob);
				link.setAttribute(
					'download',
					`${batchJob.result?.file_key.replace('.csv', '.xlsx')}`
				);
				document.body.appendChild(link); // Append to body instead of a specific element
				link.click();
				document.body.removeChild(link); // Remove from body after click
			};
			reader.readAsText(blob, 'utf-8');
		} catch (e) {
			notification.error({
				description: `Đã xảy ra lỗi trong khi tải xuống tệp ${operation.toLowerCase()}`,
			});
		}
	};

	const onDeleteFile = async () => {
		if (!batchJob.result?.file_key) {
			return;
		}

		try {
			await deleteFile({ file_key: batchJob.result?.file_key });
			notification.success({ description: `Tệp ${operation} đã bị xoá.` });
		} catch (e) {
			notification.error({
				description: `Đã xảy ra lỗi trong khi tải xuống tệp ${operation.toLowerCase()}`,
			});
		}
	};

	const getBatchJobFileCard = () => {
		const twentyfourHoursInMs = 24 * 60 * 60 * 1000;

		let icon;

		if (batchJob.status !== 'completed' && batchJob.status !== 'canceled') {
			if (batchJob.status === 'failed') {
				icon = <CircleX size={18} color="rgb(220 38 38)" />;
			} else {
				icon = <LoaderCircle size={20} className="animate-spin" />;
			}
		} else {
			let iconColor;
			if (Math.abs(relativeTimeElapsed.raw) > twentyfourHoursInMs) {
				iconColor = '#767676';
			} else {
				iconColor = 'rgb(110 231 183)';
			}
			icon = <FileBox size={20} color={iconColor} />;
		}

		const fileSize = batchJob.result?.file_key
			? bytesConverter(batchJob.result?.file_size ?? 0)
			: {
					confirmed: `Chuẩn bị ${operation.toLowerCase()}...`,
					preprocessing: `Chuẩn bị ${operation.toLowerCase()}...`,
					processing: `Đang xử lý ${operation.toLowerCase()}...`,
					completed: `${operation.toLowerCase()} thành công.`,
					failed: `Xử lý thất bại.`,
					canceled: `Đã hủy công việc ${operation.toLowerCase()}.`,
			  }[batchJob.status];

		return (
			<BatchJobFileCard
				onClick={onDownloadFile}
				fileName={fileName}
				icon={icon}
				fileSize={fileSize}
				hasError={hasError}
				errorMessage={batchJob?.result?.errors?.join(' \n')}
			/>
		);
	};

	const getFooterActions = () => {
		const buildButton = (
			onClick: any,
			variant: string,
			text: string,
			className?: string,
			danger?: boolean
		) => {
			return (
				<Button
					onClick={onClick}
					className={cn('font-medium text-xs h-[32px]', className)}
					type={variant}
					danger={danger}
				>
					{text}
				</Button>
			);
		};
		return (
			(canDownload || canCancel) && (
				<div className="mt-6 flex">
					{canDownload && (
						<div className="flex">
							{buildButton(onDeleteFile, 'default', 'Xoá', '', true)}
							{buildButton(onDownloadFile, 'text', 'Tải xuống', 'ml-2')}
						</div>
					)}
					{canCancel &&
						buildButton(() => cancelBatchJob(), 'default', 'Huỷ', '', true)}
				</div>
			)
		);
	};

	return (
		<ActivityCard
			title={store?.name ?? 'ChamdepVN'}
			icon={
				<Bell
					strokeWidth={3}
					className="mr-3"
					size={20}
					color="rgb(37 99 235)"
				/>
			}
			relativeTimeElapsed={relativeTimeElapsed.rtf}
			date={batchJob.created_at}
			shouldShowStatus={true}
		>
			<div ref={activityCardRef} className="font-normal flex flex-col">
				<span className="text-xs">{batchJobActivityDescription}</span>

				{getBatchJobFileCard()}
			</div>

			{getFooterActions()}
		</ActivityCard>
	);
};

export default BatchJobActivityList;
