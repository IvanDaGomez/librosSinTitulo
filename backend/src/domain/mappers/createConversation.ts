import { ConversationType } from '@/domain/entities/conversation'
import { ID, ISOString } from '@/shared/types'
import { parseValue } from '@/utils/parseValue'

const createConversation = (
  data: Partial<ConversationType>
): ConversationType => {
  return {
    id: parseValue<ID>(data.id, crypto.randomUUID()),
    participants: parseValue<ID[]>(data.participants, [
      crypto.randomUUID(),
      crypto.randomUUID()
    ]),
    messages_ids: parseValue<ID[]>(data.messages_ids, []),
    last_message: data.last_message ?? null,
    created_at: parseValue<ISOString>(
      data.created_at,
      new Date().toISOString() as ISOString
    ),
    updated_at: parseValue<ISOString>(
      data.updated_at,
      new Date().toISOString() as ISOString
    )
  }
}

export { createConversation }
