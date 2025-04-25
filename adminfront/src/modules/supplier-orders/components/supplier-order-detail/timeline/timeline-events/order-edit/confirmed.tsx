import { useAdminCustomer, useAdminUser } from "medusa-react"
import React from "react"

import { OrderEditEvent } from '@/modules/orders/hooks/use-build-timeline';
import { CalendarCheck2 } from 'lucide-react';
import EventContainer from "../event-container"
import { isConfirmedByUser } from '@/modules/orders/components/orders/utils/user';
import { ByLine } from "."

type ConfirmedProps = {
  event: OrderEditEvent
}

const EditConfirmed: React.FC<ConfirmedProps> = ({ event }) => {
  const confirmedByAdmin = isConfirmedByUser(event.edit)

  // const title = `${
  //   !confirmedByAdmin ? "Xác nhận chỉnh sửa đơn hàng đã được chấp nhận" : "Xác nhận cưỡng chế chỉnh sửa đơn hàng"
  // }`

  const { user } = useAdminUser(event.edit.confirmed_by as string, {
    enabled: confirmedByAdmin && !!event.edit.confirmed_by,
  })

  const { customer } = useAdminCustomer(event.edit.confirmed_by as string, {
    enabled: !confirmedByAdmin && !!event.edit.confirmed_by,
  })

  return (
    <EventContainer
      title={"Xác nhận chỉnh sửa đơn hàng"}
      time={event.time}
      isFirst={event.first}
      icon={<CalendarCheck2 size={20} />}
      midNode={<ByLine user={user || customer} />}
    />
  )
}

export default EditConfirmed
