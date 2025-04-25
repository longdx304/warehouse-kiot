import { FormImage } from '@/types/common';

export const splitFiles = (
	images: FormImage[],
	oldImgUrls: string[] | null = null
): {
	uploadImages: File[];
	existingImages: FormImage[];
	deleteImages?: string | null;
} => {
	const uploadImages: File[] = [];
	const existingImages: FormImage[] = [];

	images.forEach((image) => {
		if (image.nativeFile) {
			uploadImages.push(image.nativeFile);
		} else {
			existingImages.push(image);
		}
	});

	if (oldImgUrls) {
		const existingImgsUrl = existingImages.map((img) => img.url);
		const toDelete = oldImgUrls.filter((url) => !existingImgsUrl.includes(url));

		if (toDelete?.length) {
			return {
				uploadImages,
				existingImages,
				deleteImages: deleteImages(toDelete),
			};
		}
	}

	return { uploadImages, existingImages };
};

export const deleteImages = (fileKeys: string[] | string) => {
	let payload: string = '';

	if (!fileKeys) {
		return;
	}
	if (typeof fileKeys === 'string') {
		const fileKey = new URL(fileKeys).pathname.slice(1);
		payload = fileKey as string;
	}
	if (Array.isArray(fileKeys)) {
		const fileKey = fileKeys
			.map((url) => {
				if (typeof url === 'string') return new URL(url).pathname.slice(1);
				return null;
			})
			.filter(Boolean)
			.join(',');
		payload = fileKey as string;
	}
	return payload;
};
