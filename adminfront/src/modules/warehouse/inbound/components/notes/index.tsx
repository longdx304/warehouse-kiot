import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Input } from '@/components/Input';
import { Title } from '@/components/Typography';
import { getErrorMessage } from '@/lib/utils';
import Note from '@/modules/supplier-orders/components/supplier-order-detail/timeline/timeline-events/note';
import { message } from 'antd';
import { SendHorizontal } from 'lucide-react';
import { useAdminCreateNote, useAdminNotes } from 'medusa-react';
import { ChangeEvent, useMemo, useState } from 'react';
// import Note from './timeline-events/note';

type Props = {
	orderId: string;
	type: 'INBOUND' | 'OUTBOUND';
};

export interface NoteEvent {
	id: string;
	time: Date;
	first?: boolean;
	orderId: string;
	noNotification?: boolean;
	type: 'note';
	value: string;
	authorId: string;
}

const Notes = ({ orderId, type }: Props) => {
	const createNote = useAdminCreateNote();
	const [inputValue, setInputValue] = useState<string>('');

	const { notes, isLoading: isNotesLoading } = useAdminNotes({
		resource_id: orderId,
		limit: 100,
		offset: 0,
	});

	const events = useMemo(() => {
		if (!notes) {
			return [];
		}
		let events: any[] = [];
		for (const note of notes) {
			events.push({
				id: note.id,
				time: note.created_at,
				type: 'note',
				authorId: note.author_id,
				value: note.value,
				orderId: orderId,
			} as NoteEvent);
		}
		return events.sort((a, b) => {
			return new Date(b.time).getTime() - new Date(a.time).getTime();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isNotesLoading, notes, orderId]);

	const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;

		setInputValue(inputValue);
	};

	const onSubmit = () => {
		if (!inputValue) {
			return;
		}
		createNote.mutate(
			{
				resource_id: orderId!,
				resource_type:
					type === 'INBOUND' ? 'product-inbound' : 'product-outbound',
				value: inputValue,
			},
			{
				onSuccess: () => {
					message.success('Ghi chú đã được tạo');
				},
				onError: (err) => message.error(getErrorMessage(err)),
			}
		);
		setInputValue('');
	};

	return (
		<Card
			// loading={isLoading || isOrderLoading}
			className="px-4 max-h-[calc(100vh-80px)] overflow-y-auto sticky top-[20px]"
		>
			<div>
				<Flex align="center" justify="space-between" className="pb-4">
					<Title level={4}>{`Ghi chú`}</Title>
					{/* <div className="flex justify-end items-center gap-4">
						<ActionAbles actions={actions as any} />
					</div> */}
				</Flex>
				<Flex
					align="center"
					justify="space-between"
					className="pb-4 w-full border-solid border-0 border-b border-gray-200"
					gap={4}
				>
					<Input
						value={inputValue}
						onChange={onChangeInput}
						placeholder="Nhập ghi chú"
						className="w-full"
					/>
					<Button
						className="h-[40px]"
						type="default"
						icon={<SendHorizontal size={16} />}
						onClick={onSubmit}
					/>
				</Flex>
				<div className="flex flex-col text-xs pt-4">
					{events?.map((event, i) => {
						return <Note key={i} event={event as NoteEvent} />;
					})}
					{events?.length === 0 && (
						<div className="text-center py-4">Không có ghi chú</div>
					)}
				</div>
			</div>
		</Card>
	);
};

export default Notes;
