import React from "react"
import { ItemsShippedEvent } from "@/modules/orders/hooks/use-build-timeline";
import { Truck } from "lucide-react";
import EventContainer from "./event-container"
import EventItemContainer from "./event-item-container"

type ItemsShippedProps = {
  event: ItemsShippedEvent
}

const ItemsShipped: React.FC<ItemsShippedProps> = ({ event }) => {
  const title =
    event.sourceType === "claim"
      ? "Các sản phẩm thay thế đã được vận chuyển"
      : event.sourceType === "exchange"
      ? "Các sản phẩm trao đổi đã được vận chuyển"
      : "Các sản phẩm đã được vận chuyển"

  const detail = event.locationName
    ? `Shipped from ${event.locationName}`
    : undefined

  const args = {
    icon: <Truck size={20} />,
    time: event.time,
    title: title,
    children: event.items.map((item, index) => (
      <EventItemContainer item={item} key={index} />
    )),
    noNotification: event.noNotification,
    isFirst: event.first,
    detail,
  }
  return <EventContainer {...args} />
}

export default ItemsShipped
