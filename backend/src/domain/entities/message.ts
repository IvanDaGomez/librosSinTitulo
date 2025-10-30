import { ID, ISOString } from '@/shared/types'

export type MessageType = {
  id: ID
  sender_id: ID
  receiver_id?: ID
  conversation_id?: ID
  content: string
  created_at: ISOString
  read?: boolean
  metadata?: Record<string, any>
}

export class Message {
  public readonly id: ID
  private _sender_id: ID
  private _receiver_id?: ID
  private _conversation_id?: ID
  private _content: string
  private _created_at: ISOString
  private _read: boolean
  private _metadata?: Record<string, any>

  private constructor (props: MessageType) {
    this.id = props.id
    this._sender_id = props.sender_id
    this._receiver_id = props.receiver_id
    this._conversation_id = props.conversation_id
    this._content = props.content
    this._created_at = props.created_at
    this._read = !!props.read
    this._metadata = props.metadata
  }

  public static create (props: MessageType): Message {
    Message.assertValidProps(props)
    return new Message(props)
  }

  public static fromObject (o: MessageType): Message {
    return new Message(o)
  }

  private static assertValidProps (p: MessageType): void {
    if (!p) throw new Error('Message props required')
    if (!p.id) throw new Error('id required')
    if (!p.sender_id) throw new Error('sender_id required')
    if (!p.content || p.content.trim().length === 0)
      throw new Error('content required')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
  }

  get sender_id (): ID {
    return this._sender_id
  }

  get receiver_id (): ID | undefined {
    return this._receiver_id
  }

  get conversation_id (): ID | undefined {
    return this._conversation_id
  }

  get content (): string {
    return this._content
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get read (): boolean {
    return this._read
  }

  get metadata (): Record<string, any> | undefined {
    return this._metadata
  }

  public markRead (): void {
    this._read = true
  }

  public updateContent (newContent: string): void {
    if (!newContent || newContent.trim().length === 0) return
    this._content = newContent
  }

  public toObject (): MessageType {
    return {
      id: this.id,
      sender_id: this._sender_id,
      receiver_id: this._receiver_id,
      conversation_id: this._conversation_id,
      content: this._content,
      created_at: this._created_at,
      read: this._read,
      metadata: this._metadata
    }
  }
}

function isValidISOString (s: string): boolean {
  if (typeof s !== 'string') return false
  const t = Date.parse(s)
  return !Number.isNaN(t)
}
