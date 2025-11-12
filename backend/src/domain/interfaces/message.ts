import { StatusResponseType } from '@/domain/valueObjects/statusResponse'
import { ID } from '@/shared/types'
import { MessageType } from '@/domain/entities/message'

export interface MessageInterface {
  getAllMessages(): Promise<MessageType[]>
  getAllMessagesByConversation(id: ID): Promise<MessageType[]>
  getMessageById(id: ID): Promise<MessageType>
  sendMessage(data: Partial<MessageType>): Promise<MessageType>
  deleteMessage(id: ID): Promise<StatusResponseType>
  updateMessage(id: ID, data: Partial<MessageType>): Promise<MessageType>
  getMessagesByQuery(query: string): Promise<MessageType[]>
}
