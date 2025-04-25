import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Steps } from '@/components/Steps';
import { Title } from '@/components/Typography';
import { useAdminCreateSupplierOrders } from '@/lib/hooks/api/supplier-order';
import { useAdminUploadFile } from '@/lib/hooks/api/uploads';
import { useUser } from '@/lib/providers/user-provider';
import { LineItemReq, Supplier, SupplierOrdersReq } from '@/types/supplier';
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
	shipping_started_date?: string | Date;
	warehouse_entry_date?: string | Date;
	completed_payment_date?: string | Date;
	metadata?: Record<string, unknown>;
}

const SupplierOrdersModal: FC<Props> = ({
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
	const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
	const [showPDF, setShowPDF] = useState(false);
	const [pdfOrder, setPdfOrder] = useState<pdfOrderRes | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createSupplierOrder = useAdminCreateSupplierOrders();
	const { regions } = useAdminRegions();
	const [regionId, setRegionId] = useState<string | null>(null);
	const [isSendEmail, setIsSendEmail] = useState(false);

	const uploadFile = useAdminUploadFile();

	const { region } = useAdminRegion(regionId || '', { enabled: !!regionId });

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
			const priceItem = itemPrices.find(
				(price) => price.variantId === item.variantId
			);

			const selectedProduct = selectedRowsProducts?.find(
				(product) => product?.id === item?.variantId
			);

			const productTitle =
				selectedProduct?.product?.title + ' - ' + selectedProduct?.title;
			return {
				variantId: item.variantId,
				quantity: item.quantity,
				unit_price: priceItem ? priceItem.unit_price : undefined,
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
		const warehouseEntryDate = supplierDates.warehouseEntryDate?.toDate();
		const completedPaymentDate = supplierDates.completePaymentDate?.toDate();

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
			shipping_started_date: new Date(),
			warehouse_entry_date: warehouseEntryDate || new Date(),
			completed_payment_date: completedPaymentDate || new Date(),
			countryCode: region?.countries[0].iso_2 || 'vn',
		};

		setPdfOrder(supplierOrdersDraft);
		setShowPDF(true);
	};

	const onSubmitOrder = async () => {
		setIsSubmitting(true);

		try {
			// Generate pdf blob
			const pdfBlob = await generatePdfBlob(pdfOrder!);

			// Create a File object
			const fileName = `purchase-order.pdf`;

			// Create a File object
			const files = new File([pdfBlob], fileName, {
				type: 'application/pdf',
			});

			// Upload pdf to s3 using Medusa uploads API
			const uploadRes = await uploadFile.mutateAsync({
				files,
				prefix: 'supplier_orders',
			});

			const pdfUrl = uploadRes.uploads[0].url;

			const orderPayload: SupplierOrdersReq = {
				isSendEmail,
				lineItems: pdfOrder?.lineItems || [],
				supplierId: pdfOrder?.supplier?.id || '',
				userId: pdfOrder?.user?.id || '',
				email: pdfOrder?.user?.email || '',
				estimated_production_time:
					supplierDates.productionDate?.toDate() || new Date(),
				settlement_time: supplierDates.settlementDate?.toDate() || new Date(),
				shipping_started_date:
					supplierDates.shippingDate?.toDate() || new Date(),
				warehouse_entry_date:
					supplierDates.warehouseEntryDate?.toDate() || new Date(),
				completed_payment_date:
					supplierDates.completePaymentDate?.toDate() || new Date(),
				countryCode: region?.countries[0]?.iso_2 || 'vn',
				region_id: region?.id || '',
				currency_code: region?.currency_code || 'vnd',
				document_url: pdfUrl,
			};

			await createSupplierOrder.mutateAsync(orderPayload as any);

			message.success('Đơn hàng đã đặt và gửi cho nhà cung cấp thành công!');
			setShowPDF(false);
			handleCancel();
		} catch (error) {
			console.error('Error submitting order:', error);
			message.error('Đơn đặt đơn đặt thất bại! Vui lòng thử lại.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStep = () => {
		// Check if any selected product exists
		if (selectedProducts.length === 0) {
			message.error('Phải chọn ít nhất một sản phẩm');
			return;
		}

		// Check if itemQuantities and itemPrices have entries for all selected products
		if (
			itemQuantities.length !== selectedProducts.length ||
			itemPrices.length !== selectedProducts.length ||
			!selectedProducts.every(
				(productId) =>
					itemQuantities.some((item) => item.variantId === productId) &&
					itemPrices.some((item) => item.variantId === productId)
			)
		) {
			console.log('selectedProducts:', selectedProducts);
			console.log('itemQuantities:', itemQuantities, itemPrices);
			message.error('Phải nhập số lượng và giá cho tất cả sản phẩm đã chọn');
			return;
		}

		// Check if all quantities are greater than 0
		if (!itemQuantities.every((item) => item.quantity > 0)) {
			message.error('Số lượng sản phẩm phải lớn hơn 0');
			return;
		}

		// Check if all prices are greater than 1000
		if (!itemPrices.every((item) => item.unit_price >= 1000)) {
			message.error('Giá sản phẩm phải lớn hơn 1000 đồng');
			return;
		}

		// Check the selected region is checked
		if (!regionId) {
			message.error('Vui lòng chọn khu vực');
			return;
		}

		setCurrentStep(1);
	};

	const handleContinueOrSubmit = () => {
		if (currentStep === 0) {
			handleStep();
		} else if (currentStep === 1) {
			setCurrentStep(2);
		} else if (currentStep === 2) {
			onSaveOrder();
		}
	};

	const handleBackOrClose = () => {
		if (currentStep === 0) {
			onCancel();
		} else if (currentStep === 1) {
			setCurrentStep(0);
		} else if (currentStep === 2) {
			setCurrentStep(1);
		}
	};

	// footer
	const footer = useMemo(() => {
		return [
			<Button key="1" type="default" onClick={handleBackOrClose}>
				{currentStep !== 0 ? 'Quay lại' : 'Đóng'}
			</Button>,
			<Button
				key="2"
				onClick={handleContinueOrSubmit}
				data-testid="submit-supplier-order"
			>
				{currentStep !== 2 ? 'Tiếp tục' : 'Kiểm tra đơn đặt hàng'}
			</Button>,
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		currentStep,
		selectedProducts,
		selectedSupplier,
		supplierDates,
		itemQuantities,
		itemPrices,
	]);

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
				width={850}
				footer={footer}
				maskClosable={false}
				loading={createSupplierOrder.isLoading || isSubmitting}
			>
				<Title level={3} className="text-center">
					Tạo mới đơn đặt hàng
				</Title>
				<Steps current={currentStep} items={ITEMS_STEP} className="py-4" />
				{currentStep === 0 && (
					<ProductForm
						selectedProducts={selectedProducts}
						setSelectedProducts={setSelectedProducts}
						setSelectedRowsProducts={setSelectedRowsProducts}
						itemQuantities={itemQuantities}
						setItemQuantities={setItemQuantities}
						itemPrices={itemPrices}
						setItemPrices={setItemPrices}
						regions={regions}
						regionId={regionId}
						setRegionId={setRegionId}
					/>
				)}
				{currentStep === 1 && (
					<ProductTotalForm
						selectedRowProducts={selectedRowsProducts}
						itemQuantities={itemQuantities}
						itemPrices={itemPrices}
						regionId={regionId}
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
						<Button
							key="submit"
							type="primary"
							onClick={onSubmitOrder}
							loading={createSupplierOrder.isLoading || isSubmitting}
						>
							Tạo đơn đặt hàng
						</Button>,
					]}
					loading={createSupplierOrder.isLoading || isSubmitting}
				>
					<PDFViewer width="100%" height="600px">
						<OrderPDF order={pdfOrder} region={region} />
					</PDFViewer>
				</Modal>
			)}
		</>
	);
};

export default SupplierOrdersModal;
