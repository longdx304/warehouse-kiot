import { Metadata } from 'next';
import { Flex } from '@/components/Flex';
import { SupplierOrderEditProvider } from '@/modules/supplier-orders/components/supplier-order-detail/edit-supplier-order-modal/context';
import SupplierOrdersDetail from '@/modules/supplier-orders/templates/supplier-orders-detail';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng từ nhà cung cấp',
  description: 'Trang quản đơn hàng từ nhà cung cấp',
};

interface Props {
  params: { id: string };
}

export default async function SupplierOrderDetailPage({ params }: Readonly<Props>) {
  return (
    <Flex vertical gap="middle" className="h-full w-full">
      <SupplierOrderEditProvider supplierOrderId={params.id}>
        <SupplierOrdersDetail id={params.id} />
      </SupplierOrderEditProvider>
    </Flex>
  );
}