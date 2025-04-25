import { Option } from "./shared"

export type RegionOption = Option;

export type GiftCardRegionFormType = {
  region_id: RegionOption
}

export type GiftCardEndsAtFormType = {
  ends_at: Date | null
}

export type GiftCardBalanceFormType = {
  amount: number
}

export type GiftCardReceiverFormType = {
  email: string
  message?: string
}
