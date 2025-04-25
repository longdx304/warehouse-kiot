import { useIsMe } from '@/lib/hooks/use-is-me';
import { NoteEvent } from '@/modules/supplier-orders/hooks/use-build-timeline';
import { useAdminDeleteNote, useAdminUser } from 'medusa-react';
import EventContainer from './event-container';
import { CircleAlert, NotebookPen, TrashIcon } from 'lucide-react';
import EventActionables from './event-actionables';
import clsx from 'clsx';
import { message, Modal as AntdModal } from 'antd';
import { getErrorMessage } from '@/lib/utils';

type NoteProps = {
	event: NoteEvent;
};

const Note: React.FC<NoteProps> = ({ event }) => {
	const { user, isLoading } = useAdminUser(event.authorId);
	const deleteNote = useAdminDeleteNote(event.id);
	const isMe = useIsMe(user?.id);

	if (isLoading || !user) {
		return null;
	}

	const name =
		user.first_name && user.last_name
			? `${user.first_name} ${user.last_name}`
			: user.email;

	const handleDelete = async () => {
		AntdModal.confirm({
			title: 'Xác nhận xóa ghi chú ?',
			content: 'Bạn chắc chắn muốn xóa ghi chú này chứ ?',

			icon: (
				<CircleAlert
					style={{ width: 32, height: 24 }}
					className="mr-2"
					color="#E7B008"
				/>
			),
			okType: 'danger',
			okText: 'Đồng ý',
			cancelText: 'Huỷ',
			async onOk() {
				deleteNote.mutate(undefined, {
					onSuccess: () => message.success('Xóa ghi chú thành công'),
					onError: (err: any) => message.error(getErrorMessage(err)),
				});
				return;
			},
		});
	};

	return (
		<>
			<EventContainer
				title={name}
				icon={<NotebookPen size={20} />}
				time={event.time}
				topNode={
					<EventActionables
						actions={[
							{
								label: 'Xoá',
								icon: <TrashIcon size={20} />,
								onClick: handleDelete,
								danger: true,
							},
						]}
					/>
				}
				isFirst={event.first}
			>
				<div
					className={clsx('px-4 py-2 rounded-xl', {
						'bg-gray-50': !isMe,
						'bg-violet-50 text-violet-900': isMe,
					})}
				>
					{event.value}
				</div>
			</EventContainer>
			{/* {showDelete && (
				<DeletePrompt
					handleClose={() => setShowDelete(!showDelete)}
					onDelete={async () => deleteNote.mutate(undefined)}
					confirmText="Yes, delete"
					heading="Delete note"
					successText="Deleted note"
				/>
			)} */}
		</>
	);
};

export default Note;
