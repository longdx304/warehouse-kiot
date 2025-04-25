import React from "react";
import { AvatarName } from "@/components/Avatar";

type ByLineProps = {
  user?: { first_name: string; last_name: string; email: string }
}

export const ByLine: React.FC<ByLineProps> = ({ user }) => {
  if (!user) {
    return null
  }

  const { first_name, last_name, email } = user

  const by =
    !first_name && !last_name ? email : `${first_name || ""} ${last_name || ""}`

  return (
    <div className="font-normal text-gray-500 flex items-center">
      By
      <span className="w-[20px] h-[20px] mx-2">
        <AvatarName user={user} font="font-medium" size={20} />
      </span>
      {by}
    </div>
  )
}
