import React from 'react';
import { Typography } from 'antd';

interface ErrorTextProps {
	error?: string | null;
	'data-testid'?: string;
}

const { Text } = Typography;

export default function ErrorText({
	error,
	'data-testid': dataTestid,
}: ErrorTextProps) {
	if (!error) {
		return null;
	}

	return (
		<Text className="text-sm" data-testid={dataTestid} type="danger">
			<span>{error}</span>
		</Text>
	);
}
