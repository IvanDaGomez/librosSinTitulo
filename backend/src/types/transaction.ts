import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import { ID, ISOString } from './objects'
import { ShippingDetailsType } from './shippingDetails'

export type TransactionObjectType = {
  id?: number
  user_id: ID
  seller_id: ID
  book_id: ID
  status: string
  shipping_details: ShippingDetailsType
  date_created?: ISOString
  date_approved?: ISOString
  date_last_updated?: ISOString
  date_of_expiration?: ISOString
  money_release_date?: ISOString
  money_release_schema?: string
  money_release_status?: string
  operation_type?: string
  issuer_id?: string
  payment_method_id?: string
  payment_type_id?: string
  payment_method: {
    id: string
    type: string
  }
  status_detail?: string
  currency_id?: string
  description?: string
  live_mode?: boolean
  sponsor_id?: number
  authorization_code?: string
  integrator_id?: string
  taxes_amount?: number
  counter_currency?: string
  shipping_amount?: number
  build_version?: string
  pos_id?: string
  store_id?: string
  platform_id?: string
  corporation_id?: string
  payer?: {
    id: string
    email: string
    identification: {
      type: string
      number: string
    }
  }
  collector_id?: number
  metadata?: Record<string, any>
  additional_info?: {
    items: Array<{
      id: string
      title: string
      quantity: number
      unit_price: number
    }>
  }
  order?: {
    id: string
    type: string
  }
  external_reference?: string
  transaction_amount?: number
  transaction_amount_refunded?: number
  coupon_amount?: number
  differential_pricing_id?: string
  deduction_schema?: string
  installments?: number
  transaction_details?: {
    net_received_amount: number
    total_paid_amount: number
    overpaid_amount: number
    installment_amount: number
  }
  fee_details?: Array<{
    type: string
    amount: number
  }>
  charges_details?: Array<{
    name: string
    amount: number
  }>
  captured?: boolean
  binary_mode?: boolean
  call_for_authorize_id?: string
  statement_descriptor?: string
  card?: {
    id: string
    last_four_digits: string
    expiration_month: number
    expiration_year: number
    cardholder: {
      name: string
    }
  }
  notification_url?: string
  refunds?: Array<any>
  processing_mode?: string
  merchant_account_id?: string
  merchant_number?: string
  point_of_interaction?: {
    type: string
    sub_type: string
  }
  three_ds_info?: {
    external_resource_url: string
  }
  callback_url?: string
  coupon_code?: string
  net_amount?: number
  payment_method_option_id?: string
  taxes?: Array<{
    id: string
    name: string
    amount: number
  }>
  internal_metadata?: Record<string, any>
  response: Omit<PaymentResponse, 'api_response'>
}
