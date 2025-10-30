import { ID } from '@/shared/types'
import { ConversationType } from '@/domain/entities/conversation'

export interface ConversationInterface {
  getAllConversations(l?: number): Promise<ConversationType[]>
  getConversationsByList(conversationsIds: ID[]): Promise<ConversationType[]>
  getConversationById(conversation_id: ID): Promise<ConversationType>
  createConversation(data: Partial<ConversationType>): Promise<ConversationType>
  deleteConversation(id: ID): Promise<{ status: boolean; message: string }>
  updateConversation(
    id: ID,
    data: Partial<ConversationType>
  ): Promise<ConversationType>
}
