import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ActionAbles } from '@/components/Dropdown';
import { Empty } from '@/components/Empty';
import { Flex } from '@/components/Flex';
import { Modal } from '@/components/Modal';
import { Title } from '@/components/Typography';
import { queryClient } from '@/lib/constants/query-client';
import {
	useAdminSupplierOrderDeleteDocument,
	useCreateDocument,
} from '@/lib/hooks/api/supplier-order';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { getErrorMessage } from '@/lib/utils';
import {
	LineItemReq,
	SupplierOrder,
	SupplierOrderDocument,
} from '@/types/supplier';
import { PDFViewer } from '@react-pdf/renderer';
import { Modal as AntdModal, message } from 'antd';
import { Paperclip, Trash2 } from 'lucide-react';
import { useAdminDeleteFile } from 'medusa-react';
import Link from 'next/link';
import { useState } from 'react';
import { pdfOrderRes } from '../../supplier-orders-modal';
import OrderPDF, {
	generatePdfBlob,
} from '../../supplier-orders-modal/order-pdf';
import UploadModal from './modal-upload';

type Props = {
	order: SupplierOrder | undefined;
	isLoading: boolean;
};

const Documents = ({ order, isLoading }: Props) => {
	const deleteFile = useAdminDeleteFile();
	const deleteDocument = useAdminSupplierOrderDeleteDocument(order?.id || '');
	const { state, onOpen, onClose } = useToggleState();
	const {
		state: stateRefreshPdf,
		onOpen: onOpenRefreshPdf,
		onClose: onCloseRefreshPdf,
	} = useToggleState();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createDocument = useCreateDocument();
	const uploadFile = useAdminUploadFile();

	const isOrderCanceled = order?.status === 'canceled';

	const handleRemoveDoc = async (docId: string, docName: string) => {
		AntdModal.confirm({
			title: 'Xác nhận xoá tài liệu',
			content: 'Bạn có chắc chắn muốn xoá tài liệu này?',
			onOk: async () => {
				await deleteFile.mutateAsync(
					{
						file_key: docName,
					},
					{
						onSuccess: async () => {
							await deleteDocument.mutateAsync(docId);
							message.success('Xoá tài liệu thành công');
						},
						onError: (error: any) => {
							message.error(getErrorMessage(error));
						},
					}
				);
			},
		});
	};

	const getFileName = (url: string) => {
		const parts = new URL(url).pathname.split('/').pop();
		return parts;
	};
	const getFileKey = (url: string) => {
		const parts = new URL(url).pathname.slice(1);
		return parts;
	};

	const actions = [
		{
			label: 'Thêm tài liệu',
			onClick: onOpen,
			disabled: isOrderCanceled,
		},
		{
			label: 'Tạo đơn đặt hàng PDF',
			onClick: onOpenRefreshPdf,
			disabled: isOrderCanceled,
		},
	];

	const lineItems = order?.items?.map((item) => {
		return {
			variantId: item.variant_id,
			quantity: item.quantity,
			unit_price: item.unit_price,
			title: item?.title + ' - ' + item.variant?.title,
		};
	}) as LineItemReq[];

	const region = order?.region;

	const pdfOrder = {
		lineItems: lineItems || [],
		supplierId: order?.supplier?.id || '',
		supplier: order?.supplier,
		userId: order?.user?.id || '',
		quantity: lineItems?.reduce((total, item) => total + item.quantity, 0),
		email: order?.user?.email || '',
		user: order?.user,
		estimated_production_time: order?.estimated_production_time || new Date(),
		settlement_time: order?.settlement_time || new Date(),
		region_id: order?.region_id || '',
	} as pdfOrderRes;

	const onSubmitOrder = async () => {
		setIsSubmitting(true);

		try {
			// Generate pdf blob
			const pdfBlob = await generatePdfBlob(pdfOrder);

			// Create a File object
			const fileName = `purchase-order.pdf`;

			// Create a File object
			const files = new File([pdfBlob], fileName, {
				type: 'application/pdf',
			});

			// object form data to binary

			// Upload pdf to s3 using Medusa uploads API
			const uploadRes = await uploadFile.mutateAsync({
				files,
				prefix: 'supplier_orders',
			});

			const pdfUrl = uploadRes.uploads[0].url;

			await createDocument.mutateAsync({
				id: order?.id || '',
				document_url: [pdfUrl],
			});

			queryClient.invalidateQueries(['admin-supplier-order', order?.id]);
			message.success('Tạo tài liệu mới thành công');
			onCloseRefreshPdf();
		} catch (error) {
			console.error('error:', error);
			message.error('Tạo tài liệu thất bại');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card loading={isLoading} className="px-4">
			{!order && <Empty description="Không tìm thấy đơn hàng" />}
			{order && (
				<div>
					<Flex align="center" justify="space-between" className="pb-2">
						<Title level={4}>{`Danh sách tài liệu`}</Title>
						<div className="flex justify-end items-center gap-4">
							<ActionAbles actions={actions as any} />
						</div>
					</Flex>
					<Flex vertical gap={4} className="pt-8">
						{order?.documents?.map((doc: SupplierOrderDocument) => (
							<Flex
								key={doc.id}
								justify="space-between"
								align="center"
								className="group"
							>
								<Flex
									justify="flex-start"
									align="center"
									gap={'small'}
									className="w-fit"
								>
									<Paperclip
										size={20}
										// color="#6B7280"
										className="text-gray-500 group-hover:text-blue-600"
									/>
									<Link
										href={doc.document_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-gray-500 text-sm group-hover:text-blue-600 line-clamp-1 w-fit"
									>
										{getFileName(doc.document_url)}
									</Link>
								</Flex>
								<Trash2
									size={14}
									color="red"
									className="hidden group-hover:block cursor-pointer"
									onClick={() =>
										handleRemoveDoc(doc.id, getFileKey(doc.document_url))
									}
								/>
							</Flex>
						))}
					</Flex>
				</div>
			)}
			{state && (
				<UploadModal state={state} handleCancel={onClose} orderId={order!.id} />
			)}

			{stateRefreshPdf && (
				<Modal
					open={stateRefreshPdf}
					handleOk={onCloseRefreshPdf}
					handleCancel={onCloseRefreshPdf}
					width={850}
					footer={[
						<Button key="close" onClick={onCloseRefreshPdf} type="default">
							Thoát
						</Button>,
						<Button key="submit" type="primary" onClick={onSubmitOrder}>
							Tạo đơn đặt hàng
						</Button>,
					]}
					loading={isSubmitting}
				>
					<PDFViewer width="100%" height="600px">
						<OrderPDF order={pdfOrder as any} region={region} />
					</PDFViewer>
				</Modal>
			)}
		</Card>
	);
};

export default Documents;
