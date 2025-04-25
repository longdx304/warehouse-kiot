import { DisplayTotal } from "./display-total"

export const PaymentDetails = ({
  currency,
  swapAmount,
  manualRefund,
  swapRefund,
  returnRefund,
  paidTotal,
  refundedTotal,
}: {
  currency: string
  swapAmount: number
  manualRefund: number
  swapRefund: number
  returnRefund: number
  paidTotal: number
  refundedTotal: number
}) => {
  if (swapAmount + manualRefund + swapRefund + returnRefund === 0) {
    return null
  }

  return (
    <>
      {!!swapAmount && (
        <DisplayTotal
          currency={currency}
          totalAmount={swapAmount}
          totalTitle={"Tổng tiền các giao dịch hoán đổi"}
        />
      )}
      {!!swapRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={returnRefund}
          totalTitle={"Hoàn tiền cho các giao dịch hoán đổi"}
        />
      )}
      {!!returnRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={returnRefund}
          totalTitle={"Hoàn tiền cho hàng trả lại"}
        />
      )}
      {!!manualRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={manualRefund}
          totalTitle={"Đã hoàn tiền thủ công"}
        />
      )}
      <DisplayTotal
        variant={"large"}
        currency={currency}
        totalAmount={paidTotal - refundedTotal}
        totalTitle={"Khách hàng cần thanh toán"}
      />
    </>
  )
}
