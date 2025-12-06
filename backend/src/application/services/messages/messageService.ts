import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { MessageType } from '@/domain/entities/message.js'
import { MessageInterface } from '@/domain/interfaces/message.js'

export class MessageService implements MessageInterface {
  private messagesModel: MessageInterface

  constructor (messagesModel: MessageInterface) {
    this.messagesModel = messagesModel
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

  getAllMessages (): Promise<MessageType[]> {
    return this.handle(
      () => this.messagesModel.getAllMessages(),
      'Error getting all messages'
    )
  }

  getAllMessagesByConversation ({ id }: { id: ID }): Promise<MessageType[]> {
    return this.handle(
      () => this.messagesModel.getAllMessagesByConversation({ id }),
      `Error getting messages for conversation with id: ${id}`
    )
  }

  getMessageById ({ id }: { id: ID }): Promise<MessageType> {
    return this.handle(
      () => this.messagesModel.getMessageById({ id }),
      `Error getting message with id: ${id}`
    )
  }

  sendMessage ({ data }: { data: Partial<MessageType> }): Promise<MessageType> {
    return this.handle(
      () => this.messagesModel.sendMessage({ data }),
      'Error sending message'
    )
  }

  deleteMessage ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.messagesModel.deleteMessage({ id }),
      `Error deleting message with id: ${id}`
    )
  }

  updateMessage ({
    id,
    data
  }: {
    id: ID
    data: Partial<MessageType>
  }): Promise<MessageType> {
    return this.handle(
      () => this.messagesModel.updateMessage({ id, data }),
      `Error updating message with id: ${id}`
    )
  }

  getMessagesByQuery ({ query }: { query: string }): Promise<MessageType[]> {
    return this.handle(
      () => this.messagesModel.getMessagesByQuery({ query }),
      `Error getting messages by query: ${query}`
    )
  }
}
