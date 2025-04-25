type Props = {};

const currencyColumns = ({}: Props) => [
	{
		title: 'Code',
		dataIndex: 'code',
		key: 'code',
		fixed: 'left',
		width: 80,
		className: 'text-xs',
	},
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		// width: 150,
		className: 'text-xs',
	},
	{
		title: 'Đơn vị',
		dataIndex: 'symbol',
		key: 'symbol',
		width: 80,
		className: 'text-xs',
	},
];

export default currencyColumns;
