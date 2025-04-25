import { currencies } from '@/utils/currencies';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Handles errors returned by a Zod resolver.
 * @param resolver - The Zod resolver object.
 * @returns An object containing the reduced error messages.
 */
export function handleErrorZod(resolver: any) {
	// Check success
	if (resolver.success) {
		return false;
	}
	const errors = resolver.error.issues;

	// Reduce error return object
	return errors.reduce(
		(acc: Record<string, unknown>, current: Record<string, unknown>) => {
			acc[(current.path as string[])[0]] = current.message;
			return acc;
		},
		{}
	);
}

/**
 * Use update search query
 */
export const updateSearchQuery = (
	searchParams: any,
	updateQuery: Record<string, string>
) => {
	const newSearchParams = new URLSearchParams(searchParams.toString());
	for (const [key, value] of Object.entries(updateQuery)) {
		value ? newSearchParams.set(key, value) : newSearchParams.delete(key);
	}
	return newSearchParams.toString();
};

/**
 * @param num
 * @param option
 * @returns format price number
 */
export const formatNumber = (
	num: number,
	option?: Intl.NumberFormatOptions
) => {
	return num?.toLocaleString('vi-VN', option);
};

export const getErrorMessage = (error: any) => {
	let msg = error?.response?.data?.message;
	if (msg[0] && msg[0]?.message) {
		msg = msg[0].message;
	}
	if (!msg) {
		msg = 'Đã xảy ra lỗi khi thực hiện thao tác. Vui lòng thử lại sau.';
	}
	return msg;
};

const units: [string, number][] = [
	['B', 1],
	['Kb', 1000],
	['Mb', 1000000],
	['Gb', 1000000000],
];

export function bytesConverter(size: number): string | undefined {
	let result: string | undefined = undefined;

	for (const [unit, divider] of units) {
		if (size >= divider) {
			result = `${(size / divider).toFixed(2)} ${unit}`;
		}
	}

	return result;
}

export const getErrorStatus = (
	error: Error
): { status: number; message: string } | undefined => {
	const formattedError = JSON.parse(JSON.stringify(error));

	if ('status' in formattedError && 'message' in formattedError) {
		return { status: formattedError.status, message: formattedError.message };
	}

	return undefined;
};


/**
 * Gets the currency info for a given currency code.
 * @param currencyCode - The currency code
 * @returns The currency info or undefined if not found
 */
export const getCurrencyInfo = (currencyCode?: string) => {
	if (!currencyCode) {
		return undefined;
	}
	const currencyInfo = currencies[currencyCode.toUpperCase()];
	return currencyInfo;
};