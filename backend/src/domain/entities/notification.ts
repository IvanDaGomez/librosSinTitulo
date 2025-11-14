import { ID, ISOString } from '@/shared/types'

export type NotificationType = {
  id: ID
  user_id: ID
  type: string
  title?: string
  body?: string
  action_url?: string
  read: boolean
  created_at: ISOString
  priority?: 'low' | 'medium' | 'high'
  expires_at?: ISOString
  metadata?: Record<string, any>
}

export class Notification implements NotificationType {
  public readonly id: ID
  private _user_id: ID
  private _type: string
  private _title?: string
  private _body?: string
  private _read: boolean
  private _created_at: ISOString
  private _expires_at?: ISOString
  private _metadata?: Record<string, any>
  private _action_url?: string

  private constructor (props: NotificationType) {
    this.id = props.id
    this._user_id = props.user_id
    this._type = props.type
    this._title = props.title
    this._body = props.body
    this._action_url = props.action_url
    this._read = !!props.read
    this._created_at = props.created_at
    this._expires_at = props.expires_at
    this._metadata = props.metadata
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
    if (p.expires_at && !isValidISOString(p.expires_at))
      throw new Error('expires_at invalid')
    if (p.metadata && typeof p.metadata !== 'object')
      throw new Error('metadata invalid')
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

  get action_url (): string | undefined {
    return this._action_url
  }

  get read (): boolean {
    return this._read
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get expires_at (): ISOString | undefined {
    return this._expires_at
  }
  get metadata (): Record<string, any> | undefined {
    return this._metadata
  }

  public markRead (updatedAt?: ISOString): void {
    this._read = true
  }

  public markUnread (updatedAt?: ISOString): void {
    this._read = false
  }

  public toObject (): NotificationType {
    return {
      id: this.id,
      user_id: this._user_id,
      type: this._type,
      title: this._title,
      body: this._body,
      action_url: this._action_url,
      read: this._read,
      created_at: this._created_at
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
