import { BatchJob } from '@medusajs/medusa/dist';

export function batchJobDescriptionBuilder(
	batchJob: BatchJob,
	operation: string,
	elapsedTime?: number
): string {
	let description = '';

	const entityName = batchJob.type.split('-').reverse().pop();

	const twentyfourHoursInMs = 24 * 60 * 60 * 1000;

	switch (batchJob.status) {
		case 'failed':
			description = `${operation} ${entityName} đã thất bại.`;
			break;
		case 'canceled':
			description = `${operation} ${entityName} đã bị hủy.`;
			break;
		case 'completed':
			if (elapsedTime && Math.abs(elapsedTime) > twentyfourHoursInMs) {
				description = `Tệp ${operation} không còn khả dụng. Tệp sẽ chỉ được lưu trữ trong 24 giờ.`;
				break;
			} else {
				description = `${operation} ${entityName} đã hoàn thành.`;
				break;
			}
		case 'processing':
			description = `${operation} ${entityName} đang được xử lý. Bạn có thể đóng tab hoạt động một cách an toàn. Chúng tôi sẽ thông báo cho bạn khi quá trình xuất sẵn sàng để tải xuống.`;
			break;
		case 'confirmed':
			description = `${operation} ${entityName} đã được xác nhận và sẽ bắt đầu sớm.`;
			break;
		case 'pre_processed':
			description = `${operation} ${entityName} đang được chuẩn bị.`;
			break;
		default:
			description = `${operation} ${entityName} đã được tạo và sẽ bắt đầu sớm.`;
	}

	return description;
}
