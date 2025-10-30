export interface MessageInterface {
  getAllMessages(): Promise<MessageObjectType[]>
  getAllMessagesByConversation(id: ID): Promise<MessageObjectType[]>
  getMessageById(id: ID): Promise<MessageObjectType>
  sendMessage(data: Partial<MessageObjectType>): Promise<MessageObjectType>
  deleteMessage(id: ID): Promise<{ message: string }>
  updateMessage(
    id: ID,
    data: Partial<MessageObjectType>
  ): Promise<MessageObjectType>
  getMessagesByQuery(query: string): Promise<MessageObjectType[]>
}
