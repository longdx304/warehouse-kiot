import React from "react"
import { TimelineEvent } from "@/modules/orders/hooks/use-build-timeline";
import { Ban } from "lucide-react";
import EventContainer, { EventIconColor } from "./event-container"

type OrderCanceledProps = {
  event: TimelineEvent
}

const OrderCanceled: React.FC<OrderCanceledProps> = ({ event }) => {
  const args = {
    icon: <Ban size={20} />,
    iconColor: EventIconColor.RED,
    time: event.time,
    title: "Đã huỷ đơn hàng",
  }
  return <EventContainer {...args}  />
}

export default OrderCanceled
