import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ID } from '@/shared/types'
import { MessageType } from '@/domain/entities/message.js'

export interface MessageInterface {
  getAllMessages(): Promise<MessageType[]>
  getAllMessagesByConversation({ id }: { id: ID }): Promise<MessageType[]>
  getMessageById({ id }: { id: ID }): Promise<MessageType>
  sendMessage({ data }: { data: Partial<MessageType> }): Promise<MessageType>
  deleteMessage({ id }: { id: ID }): Promise<StatusResponseType>
  updateMessage({
    id,
    data
  }: {
    id: ID
    data: Partial<MessageType>
  }): Promise<MessageType>
  getMessagesByQuery({ query }: { query: string }): Promise<MessageType[]>
}
