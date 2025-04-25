import { useAdminCustomer, useAdminOrderEdit, useAdminUser } from "medusa-react";
import React from "react"

import { OrderEditEvent } from '@/modules/orders/hooks/use-build-timeline';
import { CircleX } from 'lucide-react';
import EventContainer from "../event-container";
import { isDeclinedByUser } from '@/modules/orders/components/orders/utils/user';
import { ByLine } from ".";

type EditDeclinedProps = {
  event: OrderEditEvent
}

const EditDeclined: React.FC<EditDeclinedProps> = ({ event }) => {
  const { order_edit: orderEdit } = useAdminOrderEdit(event.edit.id)

  const declinedByAdmin = isDeclinedByUser(event.edit)

  const { user } = useAdminUser(event.edit.declined_by as string, {
    enabled: declinedByAdmin && !!event.edit.declined_by,
  })

  const { customer } = useAdminCustomer(event.edit.declined_by as string, {
    enabled: !declinedByAdmin && !!event.edit.declined_by,
  })

  const note = orderEdit?.declined_reason

  return (
    <EventContainer
      title={"Order Edit declined"}
      icon={<CircleX size={20} />}
      time={event.time}
      isFirst={event.first}
      midNode={<ByLine user={customer || user} />}
    >
      {note && (
        <div className="px-4 py-2 mt-4 rounded-lg bg-gray-100 font-normal text-gray-900">
          {note}
        </div>
      )}
    </EventContainer>
  )
}

export default EditDeclined
