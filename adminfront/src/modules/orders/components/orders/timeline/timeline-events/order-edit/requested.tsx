import React, { useState } from "react";
import { useAdminNotifications } from "medusa-react";

import { OrderEditRequestedEvent } from '@/modules/orders/hooks/use-build-timeline';
import { Mail } from 'lucide-react';
import EventContainer from "../event-container";
import { Button } from "@/components/Button";
// import ResendModal from "../notification/resend-modal";

type RequestedProps = {
  event: OrderEditRequestedEvent
}

const EditRequested: React.FC<RequestedProps> = ({ event }) => {
  const [showResend, setShowResend] = useState(false)

  const { notifications } = useAdminNotifications({
    resource_id: event.edit?.id,
  })

  const notification = notifications?.find(
    (n) => n.event_name === "order-edit.requested"
  )

  if (!notification) {
    return null
  }

  return (
    <>
      <EventContainer
        title={"Đã gửi yêu cầu xác nhận chỉnh sửa đơn hàng"}
        icon={<Mail size={20} />}
        time={event.time}
        isFirst={event.first}
        midNode={
          <span className="font-normal text-gray-500">
            {event.email}
          </span>
        }
      >
        <Button
          size="small"
					type="default"
					className="font-medium"
          onClick={() => setShowResend(true)}
        >
          Gửi lại yêu cầu xác nhận
        </Button>
      </EventContainer>
      {/* {showResend && (
        <ResendModal
          handleCancel={() => setShowResend(false)}
          notificationId={notification.id}
          email={notification.to}
        />
      )} */}
    </>
  )
}

export default EditRequested
