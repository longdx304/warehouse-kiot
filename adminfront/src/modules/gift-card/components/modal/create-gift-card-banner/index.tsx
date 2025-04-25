import { Button } from '@/components/Button';
import { Image } from '@/components/Image';
import { Input, InputNumber, TextArea } from '@/components/Input';
import { Upload } from '@/components/Upload';
import LayeredModal, {
	LayeredModalContext,
} from '@/lib/providers/layer-modal-provider';
import { Form, message } from 'antd';
import { Trash2, X } from 'lucide-react';
import {
	useAdminCreateProduct,
	useAdminProducts,
	useAdminStore,
} from 'medusa-react';
import { useContext } from 'react';
import Medusa from '@/services/api';
import { ProductStatus } from '@/types/products';
import { getErrorMessage } from '@/lib/utils';

type NewGiftCardProps = {
	onClose: () => void;
	open: boolean;
};

type NewGiftCardFormData = {
	title: string;
	description: string | undefined;
	thumbnail: {
		url: string;
		name: string;
		size: number;
		nativeFile: File;
	} | null;
	denominations: {
		amount: number | null;
	}[];
};

const NewGiftCard = ({ onClose, open }: NewGiftCardProps) => {
	const { store } = useAdminStore();
	const { refetch } = useAdminProducts();
	const { mutate, isLoading } = useAdminCreateProduct();
	const layeredModalContext = useContext(LayeredModalContext);

	const [form] = Form.useForm();

	const onFinish = async (data: NewGiftCardFormData) => {
		let images: string[] = [];

		// if (thumbnail) {
		// 	const uploadedImgs = await Medusa.uploads
		// 		.create([thumbnail.nativeFile])
		// 		.then(({ data }: { data: any }) => {
		// 			const uploaded = data.uploads.map(({ url }: any) => url);
		// 			return uploaded;
		// 		});

		// 	images = uploadedImgs;
		// }

		mutate(
			{
				is_giftcard: true,
				title: data.title,
				description: data.description,
				discountable: false,
				options: [{ title: 'Mệnh giá' }],
				variants: data.denominations.map((d, i) => ({
					title: `${i + 1}`,
					inventory_quantity: 0,
					manage_inventory: false,
					prices: [
						{ amount: d.amount!, currency_code: store?.default_currency_code },
					],
					options: [{ value: `${d.amount}` }],
				})),
				images: images.length ? images : undefined,
				thumbnail: images.length ? images[0] : undefined,
				status: ProductStatus.PUBLISHED,
			},
			{
				onSuccess: () => {
					message.success('Thẻ quà tặng đã được tạo thành công');
					refetch();
					onClose();
				},
				onError: (err) => {
					message.error(getErrorMessage(err));
				},
			}
		);
	};

	const handleFilesChosen = (files: File[]) => {
		const toAppend = files.map((file) => ({
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			nativeFile: file,
			selected: false,
		}));
		if (toAppend?.length) {
			form.setFieldValue('thumbnail', toAppend[0]);
			return;
		}
	};

	const thumbnail = Form.useWatch('thumbnail', form) as any;
	const removeImage = () => {
		form.setFieldValue('thumbnail', null);
	};

	// Modal: Render footer buttons
	const footer = (
		<div className="flex items-center justify-end gap-2">
			<Button
				onClick={onClose}
				loading={isLoading}
				type="text"
				className="text-sm w-32 font-semibold justify-center"
			>
				Hủy
			</Button>
			<Button
				className="text-sm min-w-32 justify-center"
				loading={isLoading}
				onClick={() => {
					form.submit();
				}}
			>
				Tạo và xuất bản
			</Button>
		</div>
	);

	return (
		<LayeredModal
			context={layeredModalContext}
			onCancel={onClose}
			open={open}
			footer={footer}
			title="Tạo thẻ quà tặng"
			className="layered-modal"
			width={800}
		>
			<Form form={form} onFinish={onFinish}>
				<Form.Item
					labelCol={{ span: 24 }}
					name="title"
					label="Tên"
					className="mb-2"
					rules={[
						{ required: true, message: 'Tên thẻ quà tặng bắt buộc nhập.' },
					]}
				>
					<Input placeholder="Thẻ quà tặng tốt nhất..." />
				</Form.Item>
				<Form.Item
					labelCol={{ span: 24 }}
					name="description"
					label="Mô tả"
					className="mb-2"
				>
					<TextArea placeholder="Thẻ quà tặng tốt nhất thời đại..." />
				</Form.Item>
				<Form.Item
					name="thumbnail"
					label="Ảnh đại diện"
					className="mb-2"
					labelCol={{ span: 24 }}
					hidden={!!thumbnail}
				>
					<Upload
						onFileChosen={handleFilesChosen}
						placeholder="Khuyến nghị 1200 x 1600 (3:4), tối đa kích thước 10MB mỗi hình ảnh."
						filetypes={['image/*']}
						className="py-2"
					/>
				</Form.Item>
				{!!thumbnail && (
					<>
						<h3 className="font-semibold text-sm text-gray-500">
							{'Ảnh đại diện'}
						</h3>
						<div className="flex items-center gap-x-6">
							<Image
								src={thumbnail.url}
								alt="gift-card-thumbnail"
								width={80}
								height={80}
								className="rounded-lg object-cover object-center"
							/>
							<div className="flex flex-col gap-y-1">
								<span className="inter-small-regular">{thumbnail.name}</span>
								<div>
									<Button
										danger
										className="font-normal"
										type="default"
										onClick={removeImage}
									>
										{'Xóa'}
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
				<div className="mt-3">
					<h3 className="font-semibold text-sm text-gray-500">
						{'Mệnh giá'}
						<span className="text-rose-500">{'*'}</span>
					</h3>
					<Form.List
						name="denominations"
						rules={[
							{
								validator: (rule, value) => {
									if (!value || value.length === 0) {
										return Promise.reject('Vui lòng nhập giá');
									}
									return Promise.resolve();
								},
								message: 'Vui lòng nhập giá',
							},
						]}
					>
						{(subFields, subOpt) => (
							<>
								{subFields.map((subField, index) => (
									<div key={subField.key} className="flex gap-1 items-end">
										<Form.Item
											labelCol={{ span: 24 }}
											name={[subField.name, 'amount']}
											label="Số tiền"
											rules={[
												{ required: true, message: 'Vui lòng nhập giá' },
												{
													type: 'number',
													message: 'Giá phải là số',
												},
											]}
											className="mb-0"
										>
											<InputNumber
												allowClear
												placeholder="10,000"
												prefix={store?.default_currency_code.toUpperCase()}
											/>
										</Form.Item>
										<Button
											type="text"
											danger
											onClick={() => subOpt.remove(index)}
											icon={<Trash2 size={18} className="stroke-2" />}
										/>
									</div>
								))}
								<Button
									type="dashed"
									onClick={() => subOpt.add()}
									block
									className="mt-4"
								>
									+ Thêm mệnh giá
								</Button>
							</>
						)}
					</Form.List>
				</div>
			</Form>
		</LayeredModal>
	);
};

export default NewGiftCard;
