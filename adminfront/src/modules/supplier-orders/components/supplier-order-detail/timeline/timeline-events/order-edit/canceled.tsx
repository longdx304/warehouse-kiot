import { useAdminUser } from "medusa-react";
import React from "react";
import { ByLine } from ".";
import { OrderEditEvent } from '@/modules/orders/hooks/use-build-timeline';
import { CircleX } from 'lucide-react';
import EventContainer from "../event-container";

type EditCanceledProps = {
  event: OrderEditEvent
}

const EditCanceled: React.FC<EditCanceledProps> = ({ event }) => {
  const { user } = useAdminUser(event.edit.canceled_by as string)

  return (
    <EventContainer
      title={"Đã huỷ chỉnh sửa đơn hàng"}
      icon={<CircleX size={20} />}
      time={event.time}
      isFirst={event.first}
      midNode={<ByLine user={user} />}
    />
  )
}

export default EditCanceled
