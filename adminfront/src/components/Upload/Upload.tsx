import { FC, useRef, useState, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { UploadIcon } from 'lucide-react';

interface Props {
	onFileChosen: (files: File[]) => void;
	filetypes: string[];
	errorMessage?: string;
	placeholder?: React.ReactElement | string;
	className?: string;
	multiple?: boolean;
	text?: React.ReactElement | string;
}

const defaultText = (
	<span>
		Di chuyển hình ảnh của bạn tới đây, hoặc{' '}
		<span className="text-sky-500">click vào đây để chọn ảnh.</span>
	</span>
);

const Upload: FC<Props> = ({
	onFileChosen,
	filetypes,
	errorMessage,
	className,
	text = defaultText,
	placeholder = '',
	multiple = false,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileUploadError, setFileUploadError] = useState(false);

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;

		if (fileList) {
			onFileChosen(Array.from(fileList));
		}
	};

	const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
		setFileUploadError(false);

		e.preventDefault();

		const files: File[] = [];

		if (e.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				// If dropped items aren't files, reject them
				if (e.dataTransfer.items[i].kind === 'file') {
					const file = e.dataTransfer.items[i].getAsFile();
					if (file && filetypes.indexOf(file.type) > -1) {
						files.push(file);
					}
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				if (filetypes.indexOf(e.dataTransfer.files[i].type) > -1) {
					files.push(e.dataTransfer.files[i]);
				}
			}
		}
		if (files.length === 1) {
			onFileChosen(files);
		} else {
			setFileUploadError(true);
		}
	};

	return (
		<div
			onClick={() => inputRef?.current?.click()}
			onDrop={handleFileDrop}
			onDragOver={(e) => e.preventDefault()}
			className={cn(
				'py-4 text-sm text-[#6B7280] rounded-md border-[#E5E7EB] hover:border-[#3B82F6] hover:text-[#9CA3AF] flex h-full w-full cursor-pointer select-none flex-col items-center justify-center border-2 border-dashed transition-colors',
				className
			)}
		>
			<div className="flex flex-col w-full items-center gap-2">
				<span className="text-center text-xs lg:text-sm">{text}</span>
				<UploadIcon size={24} />
				<span className="text-center text-xs lg:text-sm">{placeholder}</span>
			</div>
			{fileUploadError && (
				<span className="text-[#E11D48]">
					{errorMessage || 'Vui lòng tải lên một tập tin đúng định dạng.'}
				</span>
			)}
			<input
				ref={inputRef}
				accept={filetypes.join(', ')}
				multiple={multiple}
				type="file"
				onChange={handleFileUpload}
				className="hidden"
			/>
		</div>
	);
};

export default Upload;
