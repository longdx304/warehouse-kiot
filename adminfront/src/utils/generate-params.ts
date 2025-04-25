export default function generateParams(query: Record<string, any>) {
	const params = Object.keys(query)
		.map((k) => {
			if (query[k] === undefined || query[k] === null || query[k] === '') {
				return null;
			}
			return `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`;
		}).filter((s) => !!s)
		.join('&');

	return params ? `?${params}` : '';
}
