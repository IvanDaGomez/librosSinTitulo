import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { MessageType } from '@/domain/entities/message.js'
import { MessageInterface } from '@/domain/interfaces/message.js'
import { ConversationInterface } from '@/domain/interfaces/conversation.js'

export class MessageService implements MessageInterface {
  private messagesModel: MessageInterface
  private conversationService?: ConversationInterface

  constructor ({
    messagesModel,
    conversationService
  }: {
    messagesModel: MessageInterface
    conversationService?: ConversationInterface
  }) {
    this.messagesModel = messagesModel
    this.conversationService = conversationService
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

  async sendMessage ({
    data
  }: {
    data: Partial<MessageType>
  }): Promise<MessageType> {
    return this.handle(async () => {
      // If conversationService is available, validate and update conversation
      if (this.conversationService && data.conversation_id && data.sender_id) {
        const conversation = await this.conversationService.getConversationById({
          id: data.conversation_id
        })

        // Validate that sender is a participant
        if (!conversation.participants.includes(data.sender_id)) {
          throw new ServiceError(
            'El usuario no se encuentra en la conversación',
            404
          )
        }

        // Update conversation's last message
        await this.conversationService.updateConversation({
          id: conversation.id,
          data: {
            last_message: data as MessageType
          }
        })
      }

      // Send the message
      return await this.messagesModel.sendMessage({ data })
    }, 'Error sending message')
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
