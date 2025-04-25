import { Flex } from '@/components/Flex';
import { ProductUnitProvider } from '@/lib/providers/product-unit-provider';
import WarehouseManage from '@/modules/warehouse/manage/templates/warehouse-manage';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Quản lý kho hàng',
	description: 'Trang quản lý kho hàng.',
};

interface Props {}

export default async function WarehouseManagePage({}: Props) {
	return (
		<Flex vertical gap="middle" className="h-full w-full">
			<ProductUnitProvider>
				<WarehouseManage />
			</ProductUnitProvider>
		</Flex>
	);
}
