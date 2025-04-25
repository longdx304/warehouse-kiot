'use client';
import { Search } from 'lucide-react';

import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Title } from '@/components/Typography';
import { updateSearchQuery } from '@/lib/utils';
import _ from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

interface Props {}

const ProductSearch = ({}: Props) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	// Function use debounce for onChange input
	const handleChangeDebounce = _.debounce(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value: inputValue } = e.target;
			// create new search params with new value
			const newSearchParams = updateSearchQuery(searchParams, {
				q: inputValue,
				page: '1',
			});

			// Replace url
			router.replace(`${pathname}?${newSearchParams}`);
		},
		750
	);

	return (
		<Card className="w-full space-y-4" rounded={false}>
			<Flex vertical gap="small" className="w-full">
				{/* Title */}
				<Title level={5}>Tìm kiếm sản phẩm</Title>
				{/* Search */}
				<Flex gap="small" className="w-full">
					<Input
						name="search"
						prefix={<Search />}
						placeholder="Vui lòng nhập tên hoặc mã sản phẩm"
						onChange={handleChangeDebounce}
					/>
				</Flex>
				{/* Filter & Sort */}
			</Flex>
		</Card>
	);
};

export default ProductSearch;
