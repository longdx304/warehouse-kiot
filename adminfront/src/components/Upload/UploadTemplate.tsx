/* eslint-disable @next/next/no-img-element */
import { Col, MenuProps, Row } from 'antd';
import { Trash2 } from 'lucide-react';
import { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ActionAbles } from '@/components/Dropdown';
import { Upload } from '@/components/Upload';
import { FormImage } from '@/types/common';
import { Text } from '../Typography';
import { Image, ImageGroup } from '../Image';

interface Props {
	files: FormImage[];
	setFiles: (files: FormImage[]) => void;
	hiddenUpload?: boolean;
}

const UploadTemplate: FC<Props> = ({
	files,
	setFiles,
	hiddenUpload = false,
}) => {
	const handleFilesChosen = (filesValue: File[]) => {
		if (filesValue.length) {
			const toAppend = filesValue.map((file, index) => ({
				id: uuidv4(),
				url: URL.createObjectURL(file),
				name: file.name,
				size: file.size,
				nativeFile: file,
				selected: false,
			}));

			const newMedia = [...files, ...toAppend];

			setFiles(newMedia);
		}
	};

	const removeImage = (id: string) => {
		const newMedia = files.filter((item: any) => item.id !== id);
		setFiles(newMedia);
	};

	return (
		<div className="w-full">
			{!hiddenUpload && (
				<div className="flex flex-col items-center">
					<span className="text-gray-500 text-lg font-medium">
						{'Thêm hình ảnh sản phẩm'}
					</span>
					<div className="mt-2 w-full">
						<Upload
							onFileChosen={handleFilesChosen}
							placeholder="Khuyến nghị 1200 x 1600 (3:4), tối đa kích thước 100MB cho các hình ảnh."
							filetypes={[
								'image/gif',
								'image/jpeg',
								'image/png',
								'image/webp',
								'image/jpg',
							]}
							className="py-2 w-full"
							multiple
						/>
					</div>
				</div>
			)}
			<div className="mt-4 w-full">
				{files?.length > 0 && (
					<div className="">
						<Text
							className="text-gray-500 text-lg font-medium text-center"
							classNameText="text-gray-500 text-lg font-medium"
						>
							Upload
						</Text>
						<ImageGroup className="gap-y-2xsmall flex flex-col">
							{files.map((file: FormImage, index: number) => {
								return (
									// eslint-disable-next-line jsx-a11y/alt-text
									<ImageWrapper
										key={index}
										image={file}
										index={index}
										remove={removeImage}
										hiddenUpload={hiddenUpload}
									/>
								);
							})}
						</ImageGroup>
					</div>
				)}
			</div>
		</div>
	);
};

export default UploadTemplate;

type ThumbnailProps = {
	image: FormImage;
	index: number;
	remove: (id: string) => void;
	hiddenUpload?: boolean;
};

const ImageWrapper = ({
	image,
	index,
	remove,
	hiddenUpload = false,
}: ThumbnailProps) => {
	const actions = [
		{
			label: <span className="w-full">Xoá</span>,
			key: 'delete',
			icon: <Trash2 size={20} />,
			danger: true,
		},
	];

	const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
		// Case item is delete
		if (key === 'delete') {
			remove(image.id);
			return;
		}
	};

	return (
		<div className="px-2 py-2 cursor-pointer hover:bg-gray-200 rounded-md group flex items-center justify-between">
			<div className="gap-x-6 flex items-center">
				<div className="flex items-center justify-center">
					<Image
						src={image.url}
						height={64}
						alt={image.name || 'Uploaded image'}
						className="rounded-[10px] max-h-[64px] max-w-[64px]"
					/>
				</div>
				<div className="flex flex-col text-left text-xs">
					<Text
						className="line-clamp-1"
						classNameText="text-xs text-gray-600"
						tooltip
					>
						{image.name}
					</Text>
					<span className="text-gray-400">
						{image.size ? `${(image.size / 1024).toFixed(2)} KB` : ''}
					</span>
				</div>
			</div>

			{!hiddenUpload && (
				<ActionAbles actions={actions} onMenuClick={handleMenuClick} />
			)}
		</div>
	);
};
