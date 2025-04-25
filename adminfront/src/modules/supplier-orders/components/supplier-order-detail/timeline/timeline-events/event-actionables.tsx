import { ActionAbles } from '@/components/Dropdown';
import React from "react"

type EventActionablesProps = {
  actions: any
}

const EventActionables: React.FC<EventActionablesProps> = ({ actions }) => {
  return (
    <ActionAbles actions={actions} />
  )
}

export default EventActionables
