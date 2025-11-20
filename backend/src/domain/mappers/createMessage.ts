import { MessageType } from '@/domain/entities/message'
import { ID, ISOString } from '@/shared/types'
import { parseValue } from '@/utils/parseValue'

const createMessage = (data: Partial<MessageType>): MessageType => {
  return {
    id: parseValue<ID>(data.id, crypto.randomUUID()),
    sender_id: parseValue<ID>(data.sender_id, crypto.randomUUID()),
    receiver_id: parseValue<ID>(data.receiver_id, crypto.randomUUID()),
    content: parseValue<string>(data.content, ''),
    conversation_id: parseValue<ID>(data.conversation_id, crypto.randomUUID()),
    created_at: parseValue<ISOString>(
      data.created_at,
      new Date().toISOString() as ISOString
    ),
    read: parseValue<boolean>(data.read, false),
    metadata: parseValue<object>(data.metadata, {})
  }
}

export { createMessage }
