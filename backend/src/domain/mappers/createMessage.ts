import { MessageType } from '@/domain/entities/message'
import { ISOString } from '@/shared/types'

const messageObject = (data: Partial<MessageType>): MessageType => {
  return {
    id: data.id ?? crypto.randomUUID(),
    sender_id: data.sender_id ?? crypto.randomUUID(),
    receiver_id: data.receiver_id ?? crypto.randomUUID(),
    content: data.content ?? '',
    conversation_id: data.conversation_id ?? crypto.randomUUID(),
    created_at: data.created_at || (new Date().toISOString() as ISOString),
    read: data.read || false,
    metadata: data.metadata ?? {}
  }
}

export { messageObject }
