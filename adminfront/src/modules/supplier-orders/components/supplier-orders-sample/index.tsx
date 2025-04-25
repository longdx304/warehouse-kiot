import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Steps } from '@/components/Steps';
import { Title } from '@/components/Typography';
import { useUser } from '@/lib/providers/user-provider';
import { LineItemReq, Supplier } from '@/types/supplier';
import { User } from '@medusajs/medusa';
import { PricedVariant } from '@medusajs/medusa/dist/types/pricing';
import { PDFViewer } from '@react-pdf/renderer';
import { message } from 'antd';
import { useAdminRegion, useAdminRegions } from 'medusa-react';
import { FC, useMemo, useState } from 'react';
import useSupplierTime from '../../hooks/use-supplier-time';
import OrderPDF, { generatePdfBlob } from './order-pdf';
import ProductTotalForm from './product-total/product-total-form';
import ProductForm from './product/product-form';
import SupplierForm from './supplier/supplier-form';

type Props = {
	state: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	suppliers: Supplier[];
};

const ITEMS_STEP = [
	{
		title: 'Chọn sản phẩm',
	},
	{
		title: 'Tổng đơn hàng',
	},
	{
		title: 'Xác nhận thông tin nhà cung cấp',
	},
];

export interface ItemQuantity {
	variantId: string;
	quantity: number;
}

export interface ItemPrice {
	variantId: string;
	unit_price: number;
}

export interface pdfOrderRes {
	isSendEmail?: boolean;
	lineItems: LineItemReq[];
	supplierId: string;
	userId: string;
	supplier?: Supplier | null;
	quantity?: number;
	user?: User | null;
	email: string;
	countryCode?: string;
	estimated_production_time: string | Date;
	settlement_time: string | Date;
	metadata?: Record<string, unknown>;
}

const SupplierOrdersSample: FC<Props> = ({
	state,
	handleOk,
	handleCancel,
	suppliers,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
		null
	);
	const [selectedRowsProducts, setSelectedRowsProducts] = useState<
		PricedVariant[]
	>([]);
	const [itemQuantities, setItemQuantities] = useState<ItemQuantity[]>([]);
	const [showPDF, setShowPDF] = useState(false);
	const [pdfOrder, setPdfOrder] = useState<pdfOrderRes | null>(null);
	const { regions } = useAdminRegions();
	const [regionId, setRegionId] = useState<string | null>(null);
	const [isSendEmail, setIsSendEmail] = useState(false);

	const { region } = useAdminRegion(regionId || '');

	// supplier date time picker
	const { supplierDates, handleDateChange, updateDatesFromSupplier } =
		useSupplierTime();

	const { user: selectedAdmin } = useUser();

	const onCancel = () => {
		setCurrentStep(0);
		setSelectedProducts([]);
		setSelectedRowsProducts([]);
		setSelectedSupplier(null);
		handleCancel();
	};

	const createPayload = () => {
		const lineItems: LineItemReq[] = itemQuantities.map((item) => {
			const selectedProduct = selectedRowsProducts?.find(
				(product) => product?.id === item?.variantId
			);

			const productTitle =
				selectedProduct?.product?.title + ' - ' + selectedProduct?.title;
			return {
				variantId: item.variantId,
				quantity: item.quantity,
				title: productTitle ?? '',
			};
		});
		return {
			lineItems: lineItems,
			products: selectedProducts,
			supplier: selectedSupplier,
			user: selectedAdmin,
		};
	};

	const onSaveOrder = async () => {
		const payload = createPayload();
		const productionDate = supplierDates.productionDate?.toDate();
		const settlementDate = supplierDates.settlementDate?.toDate();

		// Get all quantity inside lineItems
		const totalQuantity = payload?.lineItems?.reduce(
			(total, item) => total + item.quantity,
			0
		);

		const supplierOrdersDraft: pdfOrderRes = {
			isSendEmail,
			lineItems: payload?.lineItems || [],
			supplierId: payload?.supplier?.id || '',
			supplier: payload?.supplier,
			userId: payload?.user?.id || '',
			user: payload?.user as any,
			quantity: totalQuantity,
			email: payload?.user?.email || '',
			estimated_production_time: productionDate || new Date(),
			settlement_time: settlementDate || new Date(),
			countryCode: region?.countries[0].iso_2 || 'vn',
		};

		setPdfOrder(supplierOrdersDraft);
		setShowPDF(true);
	};

	const onSubmitOrder = async () => {
		if (!pdfOrder) return;

		try {
			// Generate the PDF Blob
			const pdfBlob = await generatePdfBlob(pdfOrder);

			// Create a temporary link to download the PDF
			const url = URL.createObjectURL(pdfBlob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `supplier-order-sample.pdf`;

			// Trigger the download
			link.click();

			// Cleanup the URL
			URL.revokeObjectURL(url);

			// Close the PDF modal and clear the state
			setShowPDF(false);
			setPdfOrder(null);
			handleCancel();
		} catch (error) {
			console.error('Failed to generate or download PDF:', error);
			message.error('Có lỗi xảy ra khi tạo bản mẫu. Vui lý thử lại.');
		}
	};

	// footer
	const footer = useMemo(() => {
		if (currentStep === 2) {
			return [
				<Button
					key="1"
					type="default"
					onClick={() => {
						setCurrentStep(0);
						setSelectedSupplier(null);
					}}
				>
					Quay lại
				</Button>,
				<Button
					key="2"
					onClick={onSaveOrder}
					data-testid="submit-supplier-order"
				>
					Kiểm tra đơn đặt hàng
				</Button>,
			];
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep, selectedProducts, selectedSupplier, supplierDates]);

	// handle supplier form
	const handleSupplierForm = (supplier: Supplier | null) => {
		setSelectedSupplier(supplier);
		updateDatesFromSupplier(supplier);
	};

	return (
		<>
			<Modal
				open={state}
				handleOk={handleOk}
				handleCancel={onCancel}
				width={800}
				footer={footer}
				maskClosable={false}
			>
				<Title level={3} className="text-center">
					Tạo biểu mẫu đơn hàng
				</Title>
				<Steps current={currentStep} items={ITEMS_STEP} className="py-4" />
				{currentStep === 0 && (
					<ProductForm
						selectedProducts={selectedProducts}
						setSelectedProducts={setSelectedProducts}
						setSelectedRowsProducts={setSelectedRowsProducts}
						setCurrentStep={setCurrentStep}
						handleCancel={onCancel}
						itemQuantities={itemQuantities}
						setItemQuantities={setItemQuantities}
						regions={regions}
						regionId={regionId}
						setRegionId={setRegionId}
					/>
				)}
				{currentStep === 1 && (
					<ProductTotalForm
						selectedRowProducts={selectedRowsProducts}
						itemQuantities={itemQuantities}
						setCurrentStep={setCurrentStep}
					/>
				)}
				
				{currentStep === 2 && (
					<SupplierForm
						suppliers={suppliers as Supplier[]}
						selectedSupplier={selectedSupplier}
						setSelectedSupplier={handleSupplierForm}
						supplierDates={supplierDates}
						handleDateChange={handleDateChange}
						updateDatesFromSupplier={updateDatesFromSupplier}
						setIsSendEmail={setIsSendEmail}
					/>
				)}
			</Modal>

			{/* show the contract pdf  */}
			{showPDF && pdfOrder && (
				<Modal
					open={showPDF}
					handleOk={() => setShowPDF(false)}
					handleCancel={() => setShowPDF(false)}
					width={850}
					footer={[
						<Button
							key="close"
							onClick={() => setShowPDF(false)}
							type="default"
						>
							Thoát
						</Button>,
						<Button key="submit" type="primary" onClick={onSubmitOrder}>
							Tạo bản mẫu đơn đặt hàng
						</Button>,
					]}
				>
					<PDFViewer width="100%" height="600px">
						<OrderPDF order={pdfOrder} region={region} />
					</PDFViewer>
				</Modal>
			)}
		</>
	);
};

export default SupplierOrdersSample;
