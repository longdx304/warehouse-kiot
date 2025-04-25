import { useState, useEffect } from 'react';

const useScrollDirection = () => {
	const [scrollDirection, setScrollDirection] = useState("up");

	useEffect(() => {
		let lastScrollTop =
			window && window.pageYOffset || document.documentElement.scrollTop;
		const handleScroll = () => {
			const scrollTop =
				window && window.pageYOffset || document.documentElement.scrollTop;
			if (scrollTop > lastScrollTop) {
				setScrollDirection('down');
			} else {
				setScrollDirection('up');
			}
			lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		};

		window && window.addEventListener('scroll', handleScroll);
		return () => window && window.removeEventListener('scroll', handleScroll);
	}, []);

	return scrollDirection;
};

export default useScrollDirection;
