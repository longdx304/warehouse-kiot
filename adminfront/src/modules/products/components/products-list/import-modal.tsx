import { usePolling } from '@/lib/providers/polling-provider';
import { BatchJob } from '@medusajs/medusa';
import { message } from 'antd';
import {
	CircleAlert,
	CircleCheck,
	Download,
	FileSpreadsheet,
	Trash2,
} from 'lucide-react';
import {
	useAdminBatchJob,
	useAdminCancelBatchJob,
	useAdminConfirmBatchJob,
	useAdminCreateBatchJob,
	useAdminDeleteFile,
	useAdminUploadProtectedFile,
} from 'medusa-react';
import { FC, ReactNode, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Text, Title } from '@/components/Typography';
import { cn } from '@/lib/utils';
import { downloadProductImportCSVTemplate } from './download-template';

/**
 * Hook returns a batch job. The endpoint is polled every 2s while the job is processing.
 */
function useImportBatchJob(batchJobId?: string) {
	const [batchJob, setBatchJob] = useState<BatchJob>();

	const isBatchJobProcessing =
		batchJob?.status === 'created' || batchJob?.status === 'confirmed';

	const { batch_job } = useAdminBatchJob(batchJobId!, {
		enabled: !!batchJobId,
		refetchInterval: isBatchJobProcessing ? 2000 : false,
	} as any);

	useEffect(() => {
		setBatchJob(batch_job);
	}, [batch_job]);

	return batchJob;
}

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
};

const ImportModal: FC<Props> = ({ state, handleOk, handleCancel }) => {
	const [fileKey, setFileKey] = useState();
	const [uploadFile, setUploadFile] = useState<File>();
	const [batchJobId, setBatchJobId] = useState();

	const { resetInterval } = usePolling();

	const { mutateAsync: deleteFile } = useAdminDeleteFile();
	const { mutateAsync: adminUploadFile } = useAdminUploadProtectedFile();

	const { mutateAsync: createBatchJob } = useAdminCreateBatchJob();
	const { mutateAsync: cancelBathJob } = useAdminCancelBatchJob(batchJobId!);
	const confirmBatchJob = useAdminConfirmBatchJob(batchJobId!);

	const batchJob = useImportBatchJob(batchJobId);

	const isUploaded = !!fileKey;
	const isPreprocessed = !!batchJob?.result;
	const hasError = batchJob?.status === 'failed';

	const progress = isPreprocessed
		? (batchJob!.result.advancement_count as any) /
		  (batchJob!.result.count || 1)
		: undefined;

	const status = hasError
		? 'Có lỗi xảy ra trong quá trình xử lý tệp'
		: isPreprocessed
		? undefined
		: isUploaded
		? 'Tiền xử lý...'
		: 'Đang tải lên...';

	const { name, size } = uploadFile || {};

	const errorMessage = batchJob?.result?.errors?.join(' \n');

	/**
	 * Confirm job on submit.
	 */
	const onSubmit = async () => {
		await confirmBatchJob.mutateAsync();
		message.success(
			'Xác nhận nhập để xử lý. Thông tin tiến trình có sẵn trong ngăn kéo hoạt động.'
		);
		handleCancel();
	};

	/**
	 * Upload file and use returned file key to create a batch job.
	 */
	const processUpload = async (file: File) => {
		try {
			// Read the XLSX file
			const reader = new FileReader();
			reader.onload = async (e) => {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				// Assume we want to process the first sheet
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				// Convert the worksheet to CSV with UTF-8 encoding and ; delimiter
				const csv = XLSX.utils.sheet_to_csv(worksheet, {
					FS: ';',
				});
				// Create a new File object with the CSV data
				const csvFile = new File([csv], file.name.replace('.xlsx', '.csv'), {
					type: 'text/csv;charset=utf-8',
				});
				// Upload the CSV file
				const res = await adminUploadFile(csvFile as any);
				const _fileKey = res.uploads[0].key;
				setFileKey(_fileKey as any);
				// Create batch job
				const batchJob = await createBatchJob({
					dry_run: true,
					context: { fileKey: _fileKey },
					type: 'product-import',
				});
				resetInterval();
				setBatchJobId(batchJob.batch_job.id as any);
			};
			reader.readAsArrayBuffer(file);
		} catch (e) {
			message.error('Nhập file thất bại.');
			if (fileKey) {
				await deleteFile({ file_key: fileKey });
			}
		}
	};

	const onUpload = async (file: any) => {
		setUploadFile(file);
		await processUpload(file);
	};

	const onDownloadTemplate = () => {
		downloadProductImportCSVTemplate();
	};

	/**
	 * When file upload is removed, delete file from the bucket and cancel batch job.
	 */
	const removeFile = async () => {
		setUploadFile(undefined);

		if (fileKey) {
			try {
				await deleteFile({ file_key: fileKey });
			} catch (e) {
				message.error('Không thể xóa tệp CSV');
			}
		}

		try {
			cancelBathJob();
		} catch (e) {
			message.error('Không thể hủy công việc hàng loạt');
		}

		setBatchJobId(undefined);
	};

	/**
	 * Returns create/update counts from stat descriptor.
	 */
	const getSummary = () => {
		if (!batchJob) {
			return undefined;
		}

		const res = batchJob.result?.stat_descriptors?.[0].message.match(/\d+/g);

		if (!res) {
			return undefined;
		}

		return {
			toCreate: Number(res[0]),
			toUpdate: Number(res[1]),
		};
	};

	/**
	 * Cleanup file if batch job isn't confirmed.
	 */
	const onClose = () => {
		handleCancel();
		if (
			!['confirmed', 'completed', 'canceled', 'failed'].includes(
				batchJob?.status || ''
			)
		) {
			if (fileKey) {
				deleteFile({ file_key: fileKey });
			}
			if (batchJobId) {
				cancelBathJob();
			}
		}
	};

	return (
		<Modal
			open={state}
			handleOk={onSubmit}
			isLoading={confirmBatchJob?.isLoading}
			handleCancel={onClose}
			disabled={!isPreprocessed || hasError}
			width={800}
		>
			<Title level={4} className="text-center">
				{`Import Product List`}
			</Title>
			<Flex vertical className="pb-4">
				<Text strong className="text-start pt-4 text-sm">
					{`Nhập file sản phẩm`}
				</Text>
				<Text className="text-xs text-gray-500">{`Thông qua nhập file, bạn có thể thêm hoặc cập nhật sản phẩm. Để cập nhật các sản phẩm/biến thể hiện có, bạn phải đặt một ID hiện có trong các cột ID Sản phẩm/ID Biến thể. Nếu giá trị không được thiết lập, một bản ghi mới sẽ được tạo. Bạn sẽ được yêu cầu xác nhận trước khi chúng tôi nhập khẩu sản phẩm.`}</Text>
			</Flex>
			{getSummary() && (
				<UploadSummary
					creations={getSummary()!.toCreate}
					updates={getSummary()!.toUpdate}
					type={'sản phẩm'}
				/>
			)}
			{!uploadFile ? (
				<DropArea onUpload={onUpload} />
			) : (
				<FileSummary
					size={size!}
					name={name!}
					status={status}
					hasError={hasError}
					errorMessage={errorMessage}
					// progress={progress}
					// TODO: change this to actual progress once this we can track upload
					progress={100}
					action={
						<a className="h-6 w-6 cursor-pointer" onClick={removeFile}>
							<Trash2 stroke="#9CA3AF" />
						</a>
					}
				/>
			)}
			<Flex vertical>
				<Text strong className="text-start pt-4 text-sm">
					{`Bạn không chắc chắn về cách sắp xếp danh sách của bạn?`}
				</Text>
				<Text className="text-xs text-gray-500">
					{'Tải xuống mẫu bên dưới để đảm bảo bạn đang theo đúng định dạng.'}
				</Text>
			</Flex>
			<FileSummary
				name="medusa-template.csv"
				size={2967}
				action={
					<a className="h-6 w-6 cursor-pointer" onClick={onDownloadTemplate}>
						<Download color="#9CA3AF" size={20} />
					</a>
				}
			/>
		</Modal>
	);
};

export default ImportModal;

type DropAreaProps = {
	onUpload: (d: DataTransferItem) => void;
};

const DropArea: FC<DropAreaProps> = ({ onUpload }) => {
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFileDrop = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		if (e.dataTransfer.items?.length) {
			onUpload(e.dataTransfer.items[0].getAsFile());
		}
	};

	const handleFileSelect = (e: any) => {
		onUpload(e.target.files[0]);
	};

	const onDragOver = (event: any) => {
		event.stopPropagation();
		event.preventDefault();
	};

	return (
		<div
			role="file-upload"
			onDragEnter={() => setIsDragOver(true)}
			onDragLeave={() => setIsDragOver(false)}
			onDragOver={onDragOver}
			onDrop={handleFileDrop}
			className={cn(
				'mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-6',
				{ 'opacity-50': isDragOver }
			)}
		>
			<span className="text-gray-500 text-xs">
				{'Kéo tệp của bạn vào đây hoặc'}
				<a className="text-blue-400">
					<label className="cursor-pointer" htmlFor="upload-form-file">
						{' '}
						{'nhấn để duyệt...'}
					</label>
					<input
						type="file"
						id="upload-form-file"
						className="hidden"
						// multiple
						// accept="text/csv"
						onChange={handleFileSelect}
					/>
				</a>
			</span>
			<span className="text-gray-400 text-xs">{'Chỉ hỗ trợ tệp .csv.'}</span>
		</div>
	);
};

type FileSummaryProps = {
	name: string;
	size: number;
	hasError?: boolean;
	errorMessage?: string;
	action: ReactNode;
	progress?: number;
	status?: string;
};

/**
 * Render an upload file summary (& upload progress).
 */
function FileSummary(props: FileSummaryProps) {
	const { action, name, progress, size, status, hasError, errorMessage } =
		props;

	const formattedSize =
		size / 1024 < 10
			? `${(size / 1024).toFixed(2)} KiB`
			: `${(size / (1024 * 1024)).toFixed(2)} MiB`;

	return (
		<div className="relative">
			{/* <Tooltip
        side="top"
        maxWidth={320}
        open={hasError ? undefined : false}
        content={
          hasError && errorMessage ? (
            <span className="font-normal text-rose-500">{errorMessage}</span>
          ) : null
        }
      > */}
			<div
				style={{ width: `${progress}%` }}
				className="transition-width absolute h-full duration-150 ease-in-out"
			/>
			<div className="border-1 relative mt-4 flex items-center rounded-xl border border-solid border-slate-200">
				<div className="m-4">
					<FileSpreadsheet size={30} color={progress ? '#9CA3AF' : '#2DD4BF'} />
				</div>

				<div className="my-6 flex-1">
					<div className="text-xs text-gray-700 leading-5">{name}</div>
					<div
						className={cn('text-xs text-gray-500 leading-4', {
							'text-rose-500': hasError,
						})}
					>
						{status || formattedSize}
					</div>
				</div>

				<div className="m-6">{action}</div>
			</div>
			{/* </Tooltip> */}
		</div>
	);
}

type UploadSummaryProps = {
	creations?: number;
	updates?: number;
	type: string;
};

/**
 * Render a batch update request summary.
 */
function UploadSummary(props: UploadSummaryProps) {
	const { creations, updates, type } = props;
	return (
		<div className="flex gap-6">
			<div className="text-xs text-gray-700 flex items-center">
				<CircleCheck color="#9CA3AF" size={20} className="mr-2" />
				<span className="font-semibold"> {creations || 0}&nbsp;</span> {'Mới'}{' '}
				{type}
			</div>
			<div className="text-xs text-gray-700 flex items-center">
				<CircleAlert color="#9CA3AF" size={20} className="mr-2" />
				<span className="font-semibold">{updates || 0}&nbsp;</span> {'Cập nhập'}
			</div>
		</div>
	);
}
