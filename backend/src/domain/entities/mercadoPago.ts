import { ID, ISOString } from '@/shared/types'
import { ShippingDetailsType } from '@/domain/entities/shippingDetails'

export type MercadoPagoInput = {
  form_data: {
    token?: string
    issuer_id?: string
    payment_method_id: string
    transaction_amount: number
    installments?: number
    payer: {
      email?: string
      entity_type?: string
      identification?: {
        type?: string
        number?: string
      }
    }
    transaction_details?: {
      financial_institution?: string
    }
  }
  partial_data: {
    user_id: ID
    book_id: ID
    seller_id: ID
    shipping_details: ShippingDetailsType
    transaction_amount: number
    application_fee: number
    description: string
    callback_url: string
  }
  payment_method: string
}

export type MercadoPagoType = {
  id: ID
  preference_id: string
  status: 'created' | 'approved' | 'cancelled' | 'failed'
  amount: number
  currency: string
  metadata?: Record<string, any>
  created_at: ISOString
  updated_at: ISOString
}

export class MercadoPago {
  private readonly data: MercadoPagoInput

  public readonly id: ID
  private _preference_id: string
  private _status: 'created' | 'approved' | 'cancelled' | 'failed'
  private _amount: number
  private _currency: string
  private _metadata?: Record<string, any>
  private _created_at: ISOString
  private _updated_at: ISOString

  private constructor (data: MercadoPagoInput) {
    this.data = data

    const props = data.partial_data
    this.id = props.user_id // Assuming id is derived from user_id for this context
    this._preference_id = props.book_id as unknown as string // Casting for compatibility
    this._status = 'created' // Default status
    this._amount = props.transaction_amount
    this._currency = 'USD' // Default currency, adjust as necessary
    this._metadata = {} // Initialize as empty object
    this._created_at = new Date().toISOString() as ISOString
    this._updated_at = new Date().toISOString() as ISOString
  }

  static create (input: MercadoPagoInput): MercadoPago {
    // Basic validations
    if (!input) throw new Error('MercadoPago input is required.')

    const form = input.form_data
    const partial = input.partial_data

    if (!form) throw new Error('form_data is required.')
    if (!form.payment_method_id)
      throw new Error('form_data.payment_method_id is required.')
    if (
      typeof form.transaction_amount !== 'number' ||
      form.transaction_amount <= 0
    ) {
      throw new Error('form_data.transaction_amount must be a positive number.')
    }

    if (!partial) throw new Error('partial_data is required.')
    if (!partial.user_id) throw new Error('partial_data.user_id is required.')
    if (!partial.book_id) throw new Error('partial_data.book_id is required.')
    if (!partial.seller_id)
      throw new Error('partial_data.seller_id is required.')
    if (!partial.shipping_details)
      throw new Error('partial_data.shipping_details is required.')
    if (
      typeof partial.transaction_amount !== 'number' ||
      partial.transaction_amount <= 0
    ) {
      throw new Error(
        'partial_data.transaction_amount must be a positive number.'
      )
    }
    if (
      typeof partial.application_fee !== 'number' ||
      partial.application_fee < 0
    ) {
      throw new Error(
        'partial_data.application_fee must be a non-negative number.'
      )
    }
    if (!partial.description)
      throw new Error('partial_data.description is required.')
    if (!partial.callback_url)
      throw new Error('partial_data.callback_url is required.')

    if (!input.payment_method) throw new Error('payment_method is required.')

    return new MercadoPago(input)
  }

  public static fromObject (o: MercadoPagoInput): MercadoPago {
    return new MercadoPago(o)
  }

  private static assertValidProps (p: MercadoPagoType): void {
    if (!p) throw new Error('MercadoPago props required')
    if (!p.id) throw new Error('id required')
    if (!p.preference_id) throw new Error('preference_id required')
    if (!Number.isFinite(p.amount) || p.amount < 0)
      throw new Error('amount invalid')
    if (!p.currency) throw new Error('currency required')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  toJSON (): MercadoPagoInput {
    // Return a deep copy to protect internal state
    return JSON.parse(JSON.stringify(this.data)) as MercadoPagoInput
  }

  // Convenience getters
  get form () {
    return this.data.form_data
  }

  get partial () {
    return this.data.partial_data
  }

  get paymentMethod () {
    return this.data.payment_method
  }

  get preference_id (): string {
    return this._preference_id
  }

  get status (): MercadoPagoType['status'] {
    return this._status
  }

  get amount (): number {
    return this._amount
  }

  get currency (): string {
    return this._currency
  }

  get metadata (): Record<string, any> | undefined {
    return this._metadata
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get updated_at (): ISOString {
    return this._updated_at
  }

  public toObject (): MercadoPagoType {
    return {
      id: this.id,
      preference_id: this._preference_id,
      status: this._status,
      amount: this._amount,
      currency: this._currency,
      metadata: this._metadata,
      created_at: this._created_at,
      updated_at: this._updated_at
    }
  }

  public setStatus (s: MercadoPagoType['status'], updatedAt?: ISOString): void {
    this._status = s
    this.touch(updatedAt)
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt)) throw new Error('invalid ISO')
      this._updated_at = updatedAt
    } else {
      this._updated_at = new Date().toISOString() as ISOString
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
