import { splitFiles } from '@/actions/images';
import { ActionAbles } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { Upload } from '@/components/Upload';
import { useAdminSupplierOrderCreateDocument } from '@/lib/hooks/api/supplier-order';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';

import { FormImage } from '@/types/common';
import { Col, MenuProps, message, Row } from 'antd';
import { File, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Props = {
	state: boolean;
	handleCancel: () => void;
	orderId: string;
};

const UploadModal = ({ state, handleCancel, orderId }: Props) => {
	const createDocument = useAdminSupplierOrderCreateDocument(orderId);
	const [files, setFiles] = useState<FormImage[]>([]);
	const uploadFile = useAdminUploadFile();

	const handleFilesChosen = (chosenFiles: File[]) => {
		if (chosenFiles.length) {
			const toAppend = chosenFiles.map((file, index) => {
				const updatedFileName = `supplier/documents/${file.name}`;
				const updatedFile = new (window as any).File([file], updatedFileName, {
					type: file.type,
					lastModified: file.lastModified,
				});
				return {
					id: uuidv4(),
					url: URL.createObjectURL(updatedFile),
					name: updatedFile.name,
					size: updatedFile.size,
					nativeFile: updatedFile,
					selected: false,
				};
			});

			setFiles((prevFiles) => [...prevFiles, ...toAppend]);
		}
	};

	const removeItem = (id: string) => {
		const newFiles = files.filter((item) => item.id !== id);
		setFiles(newFiles);
	};

	const handleOk = async () => {
		if (!files.length) handleCancel();
		try {
			const { uploadImages } = splitFiles(files, null);
			const { uploads } = await uploadFile.mutateAsync({
				files: uploadImages,
				prefix: 'supplier_orders',
			});
			const urls = uploads.map((item) => item.url);
			await createDocument.mutateAsync({ documents: urls });
			setFiles([]);
			handleCancel();
			message.success('Tạo tài liệu thành công');
		} catch (error) {
			console.error('error:', error);
			message.error('Tạo tài liệu thất bại');
		}
	};

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			isLoading={createDocument.isLoading}
			handleCancel={handleCancel}
			// footer={renderFooter()}
			width={800}
		>
			<Title level={3}>Upload tài liệu</Title>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<span className="text-gray-500">
						{'Thêm hình ảnh/file vào đơn hàng này.'}
					</span>
					<div className="mt-2">
						<Upload
							onFileChosen={handleFilesChosen}
							placeholder="Khuyến nghị hình ảnh 1200 x 1600 (3:4), tối đa kích thước 10MB mỗi hình ảnh/file."
							filetypes={[
								'image/*',
								'text/*',
								'application/pdf',
								'application/msword',
								'application/*',
							]}
							className="py-2"
							multiple
						/>
					</div>
				</Col>
				<Col span={24}>
					{files?.length > 0 && (
						<div className="mt-large">
							<h2 className="inter-large-semibold mb-small">Upload</h2>

							<div className="gap-y-2xsmall flex flex-col">
								{files.map((field: any, index: number) => {
									return (
										// eslint-disable-next-line jsx-a11y/alt-text
										<Item
											key={index}
											itemUpload={field}
											index={index}
											remove={removeItem}
										/>
									);
								})}
							</div>
						</div>
					)}
				</Col>
			</Row>
		</Modal>
	);
};

export default UploadModal;

type ItemProps = {
	itemUpload: FormImage;
	index: number;
	remove: (id: string) => void;
};

const Item = ({ itemUpload, index, remove }: ItemProps) => {
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
			remove(itemUpload!.id);
			return;
		}
	};

	return (
		<div className="px-2 py-2 cursor-pointer hover:bg-gray-200 rounded-md group flex items-center justify-between">
			<div className="gap-x-6 flex items-center">
				<div className="flex h-16 w-16 items-center justify-center">
					{itemUpload?.nativeFile?.type.startsWith('image') ? (
						<Image
							src={itemUpload.url}
							alt={itemUpload.name || 'Uploaded image'}
							width={64}
							height={64}
							className="rounded-[10px] max-h-[64px] max-w-[64px]"
						/>
					) : (
						<File size={20} className="text-gray-500 text-center" />
					)}
				</div>
				<div className="flex flex-col text-left text-xs">
					<span className="">{itemUpload.name}</span>
					<span className="text-gray-400">
						{itemUpload.size ? `${(itemUpload.size / 1024).toFixed(2)} KB` : ''}
					</span>
				</div>
			</div>

			<ActionAbles actions={actions} onMenuClick={handleMenuClick} />
		</div>
	);
};
