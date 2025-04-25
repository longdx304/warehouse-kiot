import { Tooltip } from '@/components/Tooltip';
import { Customer } from '@medusajs/medusa';

type Props = {};

const addCustomerColumns = ({}: Props) => [
	{
		title: 'Tên',
		dataIndex: 'name',
		key: 'name',
		fixed: 'left',
		className: 'text-xs',
		render: (_: any, record: Customer) => {
			return `${record.first_name} ${record.last_name}`;
		},
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
		className: 'text-xs',
	},
	{
		title: 'Nhóm',
		dataIndex: 'groups',
		key: 'groups',
		width: 150,
		className: 'text-xs',
		render: (_: Customer['groups']) => {
			// return (
			// 	<Tooltip title={_.map((group) => group.name).join(' - ')}>
			// 		{_?.length || 0}
			// 	</Tooltip>
			// );
			return _.map((group) => group.name).join(' - ') || '-';
		},
	},
];

export default addCustomerColumns;
