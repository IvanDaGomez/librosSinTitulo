import { ID } from '@/shared/types'
import { ConversationType } from '@/domain/entities/conversation.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { ConversationInterface } from '@/domain/interfaces/conversation.js'

export class ConversationService implements ConversationInterface {
  private conversationsModel: ConversationInterface

  constructor (conversationsModel: ConversationInterface) {
    this.conversationsModel = conversationsModel
  }

  private async handle<T> (fn: () => Promise<T>, message: string): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      throw new ServiceError(
        message,
        error instanceof ServiceError ? error.statusCode : 500,
        error instanceof Error ? error.stack : undefined
      )
    }
  }

  getAllConversations (l?: number): Promise<ConversationType[]> {
    if (l !== undefined && l < 1) l = 10
    return this.handle(
      () => this.conversationsModel.getAllConversations(l),
      'Error getting all conversations'
    )
  }

  getConversationsByList (conversationsIds: ID[]): Promise<ConversationType[]> {
    return this.handle(
      () => this.conversationsModel.getConversationsByList(conversationsIds),
      'Error getting conversations by list'
    )
  }

  getConversationById (conversation_id: ID): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.getConversationById(conversation_id),
      `Error getting conversation with id: ${conversation_id}`
    )
  }

  createConversation (
    data: Partial<ConversationType>
  ): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.createConversation(data),
      'Error creating conversation'
    )
  }

  updateConversation (
    id: ID,
    data: Partial<ConversationType>
  ): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.updateConversation(id, data),
      `Error updating conversation with id: ${id}`
    )
  }

  deleteConversation (id: ID): Promise<StatusResponseType> {
    return this.handle(
      () => this.conversationsModel.deleteConversation(id),
      `Error deleting conversation with id: ${id}`
    )
  }
}
