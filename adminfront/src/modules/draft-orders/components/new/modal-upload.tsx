import { ActionAbles } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { Upload } from '@/components/Upload';

import { FormImage } from '@/types/common';
import { Col, MenuProps, message, Row } from 'antd';
import { File, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

type Props = {
	state: boolean;
	handleCancel: () => void;
	setDataFromExcel: (data: any) => void;
};

const UploadModal = ({ state, handleCancel, setDataFromExcel }: Props) => {
	const [files, setFiles] = useState<FormImage[]>([]);

	const handleFilesChosen = (chosenFiles: File[]) => {
		if (chosenFiles.length) {
			const toAppend = chosenFiles.map((file, index) => {
				const updatedFileName = `${file.name}`;
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
			const file = files[0].nativeFile;
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (e) => {
				const binaryString = e.target?.result;
				if (!binaryString) return;

				// Đọc file Excel
				const workbook = XLSX.read(binaryString, { type: 'binary' });

				// Lấy sheet đầu tiên
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];

				// Chuyển đổi dữ liệu sheet sang JSON
				const jsonData: object[] = XLSX.utils.sheet_to_json(sheet, {
					header: 1,
				});

				// Tìm vị trí hàng bắt đầu chứa dữ liệu sản phẩm (dựa vào "STT")
				const productStartIndex = jsonData.findIndex(
					(row: any) => row[0] === 'STT'
				);

				if (productStartIndex === -1) {
					console.error('Không tìm thấy dữ liệu sản phẩm.');
					return;
				}
				const productEndIndex = jsonData
					.slice(productStartIndex + 1)
					.findIndex((row: any) => !row[0]);

				// Lọc dữ liệu sản phẩm (bỏ header và dòng tổng)
				const productData = jsonData
					.slice(productStartIndex + 1) // Bỏ header
					.slice(0, productEndIndex) // Bỏ dòng tổng

					// Chuyển đổi thành object với các key tương ứng
					.map((row: any) => ({
						sku: row[1],
						title: row[3],
						quantity: row[7] * (row[6] === 'Giỏ' ? 24 : 1),
						price: Math.round(
							(row[11] + row[15]) / (row[7] * (row[6] === 'Giỏ' ? 24 : 1))
						),
					}));

				setDataFromExcel(productData);
			};

			reader.readAsBinaryString(file);

			setFiles([]);
			handleCancel();
		} catch (error) {
			console.error('error:', error);
			message.error('Tạo tài liệu thất bại');
		}
	};

	return (
		<Modal
			open={state}
			handleOk={handleOk}
			// isLoading={createDocument.isLoading}
			handleCancel={handleCancel}
			// footer={renderFooter()}
			width={800}
		>
			<Title level={3}>Upload tài liệu</Title>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<span className="text-gray-500">
						{'Thêm file sản phẩm để tạo đơn hàng.'}
					</span>
					<div className="mt-2">
						<Upload
							onFileChosen={handleFilesChosen}
							placeholder="Khuyến nghị hình ảnh 1200 x 1600 (3:4), tối đa kích thước 100MB file."
							filetypes={[
								'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
								'application/vnd.ms-excel', // .xls
								'text/csv', // .csv
							]}
							className="py-2"
							text={
								<span>
									Di chuyển file của bạn tới đây, hoặc{' '}
									<span className="text-sky-500">
										click vào đây để chọn file.
									</span>
								</span>
							}
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
