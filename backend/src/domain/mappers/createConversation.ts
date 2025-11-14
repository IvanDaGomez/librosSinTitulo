import { ConversationType } from '@/domain/entities/conversation'
import { ISOString } from '@/shared/types'

const createConversation = (
  data: Partial<ConversationType>
): ConversationType => {
  return {
    id: data.id ?? crypto.randomUUID(),
    participants: data.participants ?? [
      crypto.randomUUID(),
      crypto.randomUUID()
    ],
    messages_ids: data.messages_ids ?? [],
    last_message: data.last_message ?? null,
    created_at: data.created_at ?? (new Date().toISOString() as ISOString),
    updated_at: data.updated_at ?? (new Date().toISOString() as ISOString)
  }
}

export { createConversation }
