import { AttachmentEvent } from '@/modules/orders/hooks/use-build-timeline';
import { File, Paperclip } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import EventContainer from './event-container';

type AttachmentProps = {
	event: AttachmentEvent;
};

const Attachment: React.FC<AttachmentProps> = ({ event }) => {
	const args = {
		icon: <File size={20} />,
		time: event.time,
		title: 'File đính kèm',
		midNode: (
			<div className="flex justify-start items-center gap-x-1">
				<Paperclip size={12} className="text-gray-500" />
				<Link
					href={event.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-500 text-[12px] group-hover:text-blue-600 line-clamp-1 w-fit"
				>
					{event.fileName}
				</Link>
			</div>
		),
		isFirst: event.first,
	};
	return <EventContainer {...args} />;
};

export default Attachment;
