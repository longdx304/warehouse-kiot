import { useState, useEffect } from 'react';

const useIsFetching = () => {
	const [isFetching, setIsFetching] = useState(false);

	return { isFetching, setIsFetching };
};

export default useIsFetching;
