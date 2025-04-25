export const removeFalsy = (
	obj: Record<string, unknown>
): Record<string, unknown> =>
	Object.entries(obj).reduce<Record<string, unknown>>((a, [k, v]) => {
		if (v) {
			a[k] = v;
		}
		return a;
	}, {});

export const removeNullish = (
	obj: Record<string, unknown>
): Record<string, unknown> =>
	Object.entries(obj).reduce<Record<string, unknown>>((a, [k, v]) => {
		if (v != null) {
			a[k] = v;
		}
		return a;
	}, {});
