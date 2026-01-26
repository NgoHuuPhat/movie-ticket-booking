export interface TopMovie {
  maPhim: string
  tenPhim: string
  anhBia: string
  countTicketSold: number
}

export interface PaymentMethod {
  methodPayment: string
  count: number
}

export interface RevenueTimeSeries {
  hour: string
  revenue: number
}

export interface RevenueByType {
  type: string
  revenue: number
}