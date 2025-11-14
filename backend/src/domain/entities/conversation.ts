import { ID, ISOString } from '@/shared/types'
import { MessageType } from './message'

export type ConversationType = {
  id: ID
  participants: ID[]
  messages_ids: ID[]
  last_message?: MessageType | null
  created_at: ISOString
  updated_at: ISOString
}

export class Conversation {
  public readonly id: ID
  private _participants: ID[]
  private _messages_ids: ID[]
  private _last_message?: MessageType | null
  private _created_at: ISOString
  private _updated_at: ISOString

  private constructor (props: ConversationType) {
    this.id = props.id
    this._participants = Array.isArray(props.participants)
      ? Array.from(new Set(props.participants))
      : []
    this._messages_ids = Array.isArray(props.messages_ids)
      ? [...props.messages_ids]
      : []
    this._last_message = props.last_message
    this._created_at = props.created_at
    this._updated_at = props.updated_at
  }

  public static create (props: ConversationType): Conversation {
    Conversation.assertValidProps(props)
    return new Conversation(props)
  }

  public static fromObject (o: ConversationType): Conversation {
    return new Conversation(o)
  }

  private static assertValidProps (p: ConversationType): void {
    if (!p) throw new Error('Conversation props required')
    if (!p.id) throw new Error('id is required')
    if (!Array.isArray(p.participants))
      throw new Error('participants must be an array')
    if (!Array.isArray(p.messages_ids))
      throw new Error('messages_ids must be an array')
    if (!p.created_at || !isValidISOString(p.created_at))
      throw new Error('created_at invalid')
    if (!p.updated_at || !isValidISOString(p.updated_at))
      throw new Error('updated_at invalid')
  }

  get participants (): ID[] {
    return [...this._participants]
  }

  get messages_ids (): ID[] {
    return [...this._messages_ids]
  }

  get last_message (): MessageType | null {
    return this._last_message ?? null
  }

  get created_at (): ISOString {
    return this._created_at
  }

  get updated_at (): ISOString {
    return this._updated_at
  }

  public toObject (): ConversationType {
    return {
      id: this.id,
      participants: [...this._participants],
      messages_ids: [...this._messages_ids],
      last_message: this._last_message,
      created_at: this._created_at,
      updated_at: this._updated_at
    }
  }

  public addParticipant (id: ID): void {
    if (!id) return
    if (!this._participants.includes(id)) this._participants.push(id)
    this.touch()
  }

  public removeParticipant (id: ID): void {
    this._participants = this._participants.filter(p => p !== id)
    this.touch()
  }

  public addMessageId (msgId: ID, message?: MessageType | null): void {
    if (!msgId) return
    this._messages_ids.push(msgId)
    if (message) this._last_message = message
    this.touch()
  }

  private touch (updatedAt?: ISOString): void {
    if (updatedAt) {
      if (!isValidISOString(updatedAt))
        throw new Error('updated_at must be valid ISO')
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
