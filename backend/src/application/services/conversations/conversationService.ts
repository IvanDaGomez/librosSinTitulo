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

  getAllConversations ({ l = 10 }: { l?: number }): Promise<ConversationType[]> {
    return this.handle(
      () => this.conversationsModel.getAllConversations({ l }),
      'Error getting all conversations'
    )
  }

  getConversationsByList ({ ids }: { ids: ID[] }): Promise<ConversationType[]> {
    return this.handle(
      () => this.conversationsModel.getConversationsByList({ ids }),
      'Error getting conversations by list'
    )
  }

  getConversationById ({ id }: { id: ID }): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.getConversationById({ id }),
      `Error getting conversation with id: ${id}`
    )
  }

  createConversation ({
    data
  }: {
    data: Partial<ConversationType>
  }): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.createConversation({ data }),
      'Error creating conversation'
    )
  }

  updateConversation ({
    id,
    data
  }: {
    id: ID
    data: Partial<ConversationType>
  }): Promise<ConversationType> {
    return this.handle(
      () => this.conversationsModel.updateConversation({ id, data }),
      `Error updating conversation with id: ${id}`
    )
  }

  deleteConversation ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.conversationsModel.deleteConversation({ id }),
      `Error deleting conversation with id: ${id}`
    )
  }
}
