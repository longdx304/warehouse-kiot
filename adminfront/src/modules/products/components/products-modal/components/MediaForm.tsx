/* eslint-disable @next/next/no-img-element */
import { Col, Form, MenuProps, Row } from 'antd';
import { Trash2 } from 'lucide-react';
import { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ActionAbles } from '@/components/Dropdown';
import { Upload } from '@/components/Upload';

interface Props {
	form: any;
}

const MediaForm: FC<Props> = ({ form }) => {
	const media = Form.useWatch('media', form) || [];

	const handleFilesChosen = (files: File[]) => {
		if (files.length) {
			const toAppend = files.map((file, index) => ({
				id: uuidv4(),
				url: URL.createObjectURL(file),
				name: file.name,
				size: file.size,
				nativeFile: file,
				selected: false,
			}));

			const newMedia = media.concat(toAppend);

			form.setFieldValue(`media`, newMedia);
		}
	};

	const removeImage = (id: string) => {
		const newMedia = media.filter((item: any) => item.id !== id);
		form.setFieldValue(`media`, newMedia);
	};

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<span className="text-gray-500">
					{'Thêm hình ảnh vào sản phẩm của bạn.'}
				</span>
				<div className="mt-2">
					<Form.Item name="media">
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
							className="py-2"
							multiple
						/>
					</Form.Item>
				</div>
			</Col>
			<Col span={24}>
				{media?.length > 0 && (
					<div className="mt-large">
						<h2 className="inter-large-semibold mb-small">Upload</h2>

						<div className="gap-y-2xsmall flex flex-col">
							{media.map((field: any, index: number) => {
								return (
									// eslint-disable-next-line jsx-a11y/alt-text
									<Image
										key={index}
										image={field}
										index={index}
										remove={removeImage}
									/>
								);
							})}
						</div>
					</div>
				)}
			</Col>
		</Row>
	);
};

export default MediaForm;

type ThumbnailProps = {
	image: any;
	index: number;
	remove: (id: string) => void;
};

const Image = ({ image, index, remove }: ThumbnailProps) => {
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
				<div className="flex h-16 w-16 items-center justify-center">
					<img
						src={image.url}
						alt={image.name || 'Uploaded image'}
						className="rounded-[10px] max-h-[64px] max-w-[64px]"
					/>
				</div>
				<div className="flex flex-col text-left text-xs">
					<span className="">{image.name}</span>
					<span className="text-gray-400">
						{image.size ? `${(image.size / 1024).toFixed(2)} KB` : ''}
					</span>
				</div>
			</div>

			<ActionAbles actions={actions} onMenuClick={handleMenuClick} />
		</div>
	);
};
