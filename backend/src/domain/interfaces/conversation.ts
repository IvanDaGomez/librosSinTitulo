import { ID } from '@/shared/types'
import { ConversationType } from '@/domain/entities/conversation.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface ConversationInterface {
  getAllConversations({ l }: { l?: number }): Promise<ConversationType[]>
  getConversationsByList({ ids }: { ids: ID[] }): Promise<ConversationType[]>
  getConversationById({ id }: { id: ID }): Promise<ConversationType>
  createConversation({
    data
  }: {
    data: Partial<ConversationType>
  }): Promise<ConversationType>
  deleteConversation({ id }: { id: ID }): Promise<StatusResponseType>
  updateConversation({
    id,
    data
  }: {
    id: ID
    data: Partial<ConversationType>
  }): Promise<ConversationType>
}
