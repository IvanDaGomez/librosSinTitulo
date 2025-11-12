import { ID, ISOString } from '@/shared/types'

export type NotificationType = {
  id: ID
  user_id: ID
  type: string
  title?: string
  body?: string
  payload?: Record<string, any>
  read: boolean
  created_at: ISOString
  updated_at: ISOString
  priority?: 'low' | 'medium' | 'high'
}

export class Notification {
  public readonly id: ID
  private _user_id: ID
  private _type: string
  private _title?: string
  private _body?: string
  private _payload?: Record<string, any>
  private _read: boolean
  private _created_at: ISOString
  private _updated_at: ISOString

  private constructor (props: NotificationType) {
    this.id = props.id
    this._user_id = props.user_id
    this._type = props.type
    this._title = props.title
    this._body = props.body
    this._payload = props.payload
    this._read = !!props.read
    this._created_at = props.created_at
    this._updated_at = props.updated_at
  }

  public static create (props: NotificationType): Notification {
    Notification.assertValidProps(props)
    return new Notification(props)
  }

  public static fromObject (o: NotificationType): Notification {
    return new Notification(o)
  }

  private static assertValidProps (p: NotificationType): void {
    if (!p) throw new Error('Notification props required')
    if (!p.id) throw new Error('id required')
    if (!p.user_id) throw new Error('user_id required')
    if (!p.type) throw new Error('type required')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  get user_id (): ID {
    return this._user_id
  }

  get type (): string {
    return this._type
  }

  get title (): string | undefined {
    return this._title
  }

  get body (): string | undefined {
    return this._body
  }

  get payload (): Record<string, any> | undefined {
    return this._payload
  }

  get read (): boolean {
    return this._read
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get updated_at (): ISOString {
    return this._updated_at
  }

  public markRead (updatedAt?: ISOString): void {
    this._read = true
    this.touch(updatedAt)
  }

  public markUnread (updatedAt?: ISOString): void {
    this._read = false
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

  public toObject (): NotificationType {
    return {
      id: this.id,
      user_id: this._user_id,
      type: this._type,
      title: this._title,
      body: this._body,
      payload: this._payload,
      read: this._read,
      created_at: this._created_at,
      updated_at: this._updated_at
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
