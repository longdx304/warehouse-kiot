/* eslint-disable jsx-a11y/alt-text */

import { Region } from '@medusajs/medusa';
import {
	Document,
	Font,
	Page,
	pdf,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { FC } from 'react';
import { pdfOrderRes } from '..';
import { formatNumber } from '@/lib/utils';

// Register fonts that supports Vietnamese characters
Font.register({
	family: 'Roboto',
	src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// Styles for PDF
const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontFamily: 'Roboto',
		fontSize: 10,
		lineHeight: 1.5,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#dddddd',
	},
	section: {
		marginBottom: 15,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eeeeee',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	column: {
		flex: 1,
		marginRight: 10,
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	label: {
		fontSize: 9,
		fontWeight: 'bold',
		color: '#666666',
		marginBottom: 3,
	},
	text: {
		fontSize: 10,
	},
	tableHeader: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#dddddd',
		paddingBottom: 5,
		marginBottom: 5,
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#eeeeee',
		paddingVertical: 5,
		alignItems: 'center',
	},
	tableCell: {
		flex: 1,
		fontSize: 9,
		paddingHorizontal: 5,
	},
	productCell: {
		flex: 2,
		flexDirection: 'column',
		textAlign: 'left',
	},
	quantityTotal: {
		fontWeight: 'bold',
		textAlign: 'center',
	},
	totalAmount: {
		fontWeight: 'bold',
		fontSize: 10,
	},
	emptyCell: {
		textAlign: 'center',
		color: '#999999',
	},
});

interface OrderPDFProps {
	order: pdfOrderRes;
	region?: Region;
}

const OrderPDFDocument: FC<OrderPDFProps> = ({ order, region }) => {
	const total = order.lineItems.reduce(
		(sum, item) => sum + item.quantity * (item.unit_price || 0),
		0
	);

	if (!order) {
		return null;
	}

	// Sort items based on the variant product id
	const sortedItems = [...order.lineItems].sort((a, b) => {
		const productIdA = a.variantId || '';
		const productIdB = b.variantId || '';
		return productIdA.localeCompare(productIdB);
	});

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<View>
						<Text style={styles.title}>Purchase Order</Text>
					</View>
					<View>
						<Text style={styles.text}>
							Date: {dayjs(new Date()).format('DD/MM/YYYY')}
						</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.title}>Customer Details</Text>
					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Customer Name</Text>
							<Text
								style={styles.text}
							>{`${order.customer?.last_name} ${order.customer?.first_name}`}</Text>
						</View>
						<View style={styles.column}>
							<Text style={styles.label}>Address</Text>
							<Text style={styles.text}>{order.address}</Text>
						</View>
					</View>
					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Customer Email</Text>
							<Text style={styles.text}>{order.customer?.email}</Text>
						</View>
						<View style={styles.column}>
							<Text style={styles.label}>Phone Number</Text>
							<Text style={styles.text}>{order.customer?.phone}</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.title}>Order Details</Text>
					<View style={styles.row}>
						<View style={styles.column}>
							<Text style={styles.label}>Ordered By</Text>
							<Text style={styles.text}>{order.email}</Text>
						</View>
						<View style={styles.column}>
							<Text style={styles.label}>User</Text>
							<Text style={styles.text}>
								{order.user?.first_name} {order.user?.last_name}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.title}>Order Items</Text>
					<View style={styles.tableHeader}>
						<Text style={styles.tableCell}>#</Text>
						<Text style={[styles.tableCell, { flex: 2 }]}>Product</Text>
						<Text style={styles.tableCell}>Unit Price</Text>
						<Text style={styles.tableCell}>Quantity</Text>
						<Text style={styles.tableCell}>Total</Text>
					</View>

					{sortedItems.map((item, index) => {
						return (
							<View key={index} style={styles.tableRow}>
								<Text style={styles.tableCell}>{index + 1}</Text>

								<View style={[styles.tableCell, styles.productCell]}>
									<Text>{item.title}</Text>
								</View>
								<Text style={styles.tableCell}>
									{item.unit_price?.toLocaleString()} {region?.currency?.symbol}
								</Text>
								<Text style={styles.tableCell}>
									{formatNumber(item.quantity)}
								</Text>
								<Text style={styles.tableCell}>
									{(item.quantity * (item.unit_price || 0)).toLocaleString()}{' '}
									{region?.currency?.symbol}
								</Text>
							</View>
						);
					})}

					{/* Overview */}
					<View style={styles.tableRow}>
						<Text style={styles.tableCell}>{'-'}</Text>
						<View style={[styles.tableCell, styles.productCell]}>
							<Text>{'-'}</Text>
						</View>
						<Text style={styles.tableCell}>{'-'}</Text>
						<Text style={styles.tableCell}>
							{formatNumber(order.totalQuantity)}
						</Text>
						<Text style={styles.tableCell}>
							{total.toLocaleString()} {region?.currency?.symbol}
						</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export const OrderPDF: FC<OrderPDFProps> = (props) => {
	return <OrderPDFDocument {...props} />;
};

export const generatePdfBlob = async (order: pdfOrderRes) => {
	const blob = await pdf(<OrderPDFDocument order={order} />).toBlob();
	return blob;
};

export default OrderPDF;
