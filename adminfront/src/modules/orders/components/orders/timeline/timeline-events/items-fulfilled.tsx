import React from "react"
import { ItemsFulfilledEvent } from "@/modules/orders/hooks/use-build-timeline"
import EventContainer from "./event-container"
import EventItemContainer from "./event-item-container"
import { Package } from "lucide-react";

type ItemsFulfilledProps = {
  event: ItemsFulfilledEvent
}

const ItemsFulfilled: React.FC<ItemsFulfilledProps> = ({ event }) => {
  const title =
    event.sourceType === "claim"
      ? "Các sản phẩm thay thế đã được đóng gói"
      : event.sourceType === "exchange"
      ? "Các sản phẩm trao đổi đã được đóng gói"
      : "Các sản phẩm đã được đóng gói"

  const detail = event.locationName
    ? `Shipping from ${event.locationName}`
    : undefined

  const args = {
    icon: <Package size={20} />,
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

export default ItemsFulfilled
