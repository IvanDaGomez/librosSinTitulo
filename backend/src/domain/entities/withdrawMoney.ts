import { ID, ISOString } from '@/shared/types'

export type WithdrawMoneyType = {
  id: ID
  user_id: ID
  amount: number
  fee?: number
  status: 'requested' | 'processed' | 'cancelled' | 'failed'
  method?: string
  created_at: ISOString
  processed_at?: ISOString
}

export class WithdrawMoney {
  public readonly id: ID
  private _user_id: ID
  private _amount: number
  private _fee?: number
  private _status: WithdrawMoneyType['status']
  private _method?: string
  private _created_at: ISOString
  private _processed_at?: ISOString

  private constructor (props: WithdrawMoneyType) {
    this.id = props.id
    this._user_id = props.user_id
    this._amount = props.amount
    this._fee = props.fee
    this._status = props.status
    this._method = props.method
    this._created_at = props.created_at
    this._processed_at = props.processed_at
  }

  public static create (props: WithdrawMoneyType): WithdrawMoney {
    WithdrawMoney.assertValidProps(props)
    return new WithdrawMoney(props)
  }

  public static fromObject (o: WithdrawMoneyType): WithdrawMoney {
    return new WithdrawMoney(o)
  }

  private static assertValidProps (p: WithdrawMoneyType): void {
    if (!p) throw new Error('WithdrawMoney props required')
    if (!p.id) throw new Error('id required')
    if (!p.user_id) throw new Error('user_id required')
    if (!Number.isFinite(p.amount) || p.amount <= 0)
      throw new Error('amount invalid')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
  }

  get user_id (): ID {
    return this._user_id
  }
  get amount (): number {
    return this._amount
  }
  get fee (): number | undefined {
    return this._fee
  }
  get status (): WithdrawMoneyType['status'] {
    return this._status
  }
  get method (): string | undefined {
    return this._method
  }
  get created_at (): ISOString {
    return this._created_at
  }
  get processed_at (): ISOString | undefined {
    return this._processed_at
  }

  public markProcessed (processedAt?: ISOString): void {
    this._status = 'processed'
    if (processedAt) {
      if (!isValidISOString(processedAt))
        throw new Error('processed_at invalid')
      this._processed_at = processedAt
    } else {
      this._processed_at = new Date().toISOString() as ISOString
    }
  }

  public cancel (): void {
    this._status = 'cancelled'
  }

  public toObject (): WithdrawMoneyType {
    return {
      id: this.id,
      user_id: this._user_id,
      amount: this._amount,
      fee: this._fee,
      status: this._status,
      method: this._method,
      created_at: this._created_at,
      processed_at: this._processed_at
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
