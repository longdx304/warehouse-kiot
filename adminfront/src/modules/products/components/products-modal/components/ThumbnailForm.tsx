/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Col, Form, MenuProps, Row } from 'antd';
import { Trash2 } from 'lucide-react';
import { FC } from 'react';

import { ActionAbles } from '@/components/Dropdown';
import { Upload } from '@/components/Upload';

interface Props {
	form: any;
}

const ThumbnailForm: FC<Props> = ({ form }) => {
	const thumbnail = Form.useWatch('thumbnail', form) || [];

	const handleFilesChosen = (files: File[]) => {
		const toAppend = files.map((file) => ({
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			nativeFile: file,
			selected: false,
		}));

		if (toAppend?.length) {
			form.setFieldValue('thumbnail', toAppend);
			return;
		}
	};

	const removeImage = () => {
		form.setFieldValue('thumbnail', []);
	};

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<span className="text-gray-500">
					{
						'Sử dụng để đại diện cho sản phẩm của bạn trong quá trình thanh toán, chia sẻ xã hội và nhiều hơn nữa.'
					}
				</span>
				<Form.Item name="thumbnail" className="mt-2">
					<Upload
						onFileChosen={handleFilesChosen}
						placeholder="Khuyến nghị 1200 x 1600 (3:4), tối đa kích thước 10MB mỗi hình ảnh."
						filetypes={['image/*']}
						className="py-2"
					/>
				</Form.Item>
			</Col>
			<Col span={24}>
				{Array.isArray(thumbnail) && thumbnail?.length > 0 ? (
					<div className="mt-large">
						<h2 className="inter-large-semibold mb-small">Upload</h2>
						<div className="gap-y-2xsmall flex flex-col">
							{thumbnail.map((field: any, index: number) => {
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
				) : typeof thumbnail === 'string' && thumbnail ? (
					<div className="mt-large">
						<h2 className="inter-large-semibold mb-small">Uploaded Image</h2>
						<div className="gap-y-2xsmall flex flex-col">
							<Image
								// eslint-disable-next-line jsx-a11y/alt-text
								image={{ url: thumbnail, name: 'Thumbnail' }}
								index={0}
								remove={removeImage}
							/>
						</div>
					</div>
				) : null}
			</Col>
		</Row>
	);
};

export default ThumbnailForm;

type ThumbnailProps = {
	image: any;
	index: number;
	remove: () => void;
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
			remove();
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
