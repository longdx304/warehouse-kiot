import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text, Title } from '@/components/Typography';
import useToggleState from '@/lib/hooks/use-toggle-state';
import { Product } from '@medusajs/medusa';
import {
	useAdminDeleteProduct,
	useAdminProducts,
	useAdminStore,
	useAdminUpdateProduct,
} from 'medusa-react';
import { useMemo } from 'react';
import GiftCardBanner from './banner';
import { useRouter } from 'next/navigation';
import NewGiftCard from '@/modules/gift-card/components/modal/create-gift-card-banner';
import { ERoutes } from '@/types/routes';
import { message, Modal } from 'antd';
import { CircleAlert } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { ProductStatus } from '@/types/products';

const ManageGiftCardBanner = () => {
	const router = useRouter();
	const { products, isLoading } = useAdminProducts({
		is_giftcard: true,
	});

	const { state, onOpen, onClose } = useToggleState(false);
	const { store } = useAdminStore();

	const giftCard = products?.[0];

	const updateGiftCard = useAdminUpdateProduct(giftCard?.id!);
	const deleteGiftCard = useAdminDeleteProduct(giftCard?.id!);

	const giftCardWithCurrency = useMemo(() => {
		if (!giftCard || !store) {
			return null;
		}

		return {
			...(giftCard as Product),
			defaultCurrency: store.default_currency_code,
		};
	}, [giftCard, store]);

	const onDelete = async () => {
		Modal.confirm({
			title: 'Bạn có muốn xoá banner thẻ quà tặng này không ?',
			content:
				'Banner thẻ quà tặng sẽ bị xoá khỏi hệ thống này. Bạn chắc chắn muốn xoá chứ?',
			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				deleteGiftCard.mutateAsync(undefined, {
					onSuccess: () => {
						message.success('Xoá banner thẻ quà tặng thành công!');
					},
					onError: (error: any) => {
						message.error(getErrorMessage(error));
					},
				});
			},
		});
	};

	const onUpdate = async () => {
		let status: ProductStatus = ProductStatus.PUBLISHED;
		if (giftCard?.status === 'published') {
			status = ProductStatus.DRAFT;
		}

		updateGiftCard.mutate(
			{ status },
			{
				onSuccess: () => {
					message.success('Đã thay đổi trạng thái thành công!');
				},
				onError: (error: any) => {
					message.error(getErrorMessage(error));
				},
			}
		);
	};

	return (
		<Card className="w-full" bordered={false} loading={isLoading}>
			{giftCardWithCurrency ? (
				<GiftCardBanner
					{...giftCardWithCurrency}
					onDelete={onDelete}
					onEdit={() => router.push(`${ERoutes.GIFT_CARDS}/manage`)}
					onUnpublish={onUpdate}
				/>
			) : (
				<div className="flex flex-col gap-2">
					<Title level={5}>
						{'Bạn đã sẵn sàng bán thẻ quà tặng đầu tiên của mình chưa?'}
					</Title>
					<Text className="text-gray-500 text-xs">
						{'Chưa có thẻ quà tặng nào được thêm vào.'}
					</Text>
					<div>
						<Button type="link" className="p-0" onClick={onOpen}>
							{'Tạo thẻ quà tặng'}
						</Button>
					</div>
				</div>
			)}
			{state && <NewGiftCard open={state} onClose={onClose} />}
		</Card>
	);
};

export default ManageGiftCardBanner;
