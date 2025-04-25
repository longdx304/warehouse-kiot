import { ListProps as AntdListProps, List as AntdList } from 'antd';

interface Props extends AntdListProps<any> {
	className?: string;
}

const List = ({ className, ...props }: Props) => {
	return <AntdList className={className} {...props} />;
};

List.Item = AntdList.Item;

export default List;
