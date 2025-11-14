import { ID, ISOString } from '@/shared/types'

export type TransactionType = {
  id: ID
  from_id: ID
  to_id: ID
  book_id: ID
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method?: string
  metadata?: Record<string, any>
  created_at: ISOString
  updated_at: ISOString
}

export class Transaction {
  public readonly id: ID
  private _from_id: ID
  private _to_id: ID
  private _book_id: ID
  private _amount: number
  private _currency: string
  private _status: TransactionType['status']
  private _method?: string
  private _metadata?: Record<string, any>
  private _created_at: ISOString
  private _updated_at: ISOString

  private constructor (props: TransactionType) {
    this.id = props.id
    this._from_id = props.from_id
    this._to_id = props.to_id
    this._amount = props.amount
    this._currency = props.currency
    this._status = props.status
    this._method = props.method
    this._book_id = props.book_id
    this._metadata = props.metadata
    this._created_at = props.created_at
    this._updated_at = props.updated_at
  }

  public static create (props: TransactionType): Transaction {
    Transaction.assertValidProps(props)
    return new Transaction(props)
  }

  public static fromObject (o: TransactionType): Transaction {
    return new Transaction(o)
  }

  private static assertValidProps (p: TransactionType): void {
    if (!p) throw new Error('Transaction props required')
    if (!p.id) throw new Error('id required')
    if (!p.from_id) throw new Error('from_id required')
    if (!p.to_id) throw new Error('to_id required')
    if (!Number.isFinite(p.amount) || p.amount < 0)
      throw new Error('amount invalid')
    if (!p.currency) throw new Error('currency required')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  get from_id (): ID {
    return this._from_id
  }

  get to_id (): ID {
    return this._to_id
  }

  get amount (): number {
    return this._amount
  }

  get currency (): string {
    return this._currency
  }

  get status (): TransactionType['status'] {
    return this._status
  }

  get method (): string | undefined {
    return this._method
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
  get book_id (): ID {
    return this._book_id
  }

  public setStatus (s: TransactionType['status'], updatedAt?: ISOString): void {
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

  public toObject (): TransactionType {
    return {
      id: this.id,
      from_id: this._from_id,
      to_id: this._to_id,
      amount: this._amount,
      currency: this._currency,
      status: this._status,
      method: this._method,
      metadata: this._metadata,
      created_at: this._created_at,
      updated_at: this._updated_at,
      book_id: this._book_id
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
