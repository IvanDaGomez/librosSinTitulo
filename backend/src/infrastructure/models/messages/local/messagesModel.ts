import fs from 'node:fs/promises'
import { createMessage } from '@/domain/mappers/createMessage.js'
import { MessageType } from '@/domain/entities/message.js'
import { ID } from '@/shared/types'
import path from 'node:path'
// __dirname is not available in ES modules, so we need to use import.meta.url
import { __dirname } from '@/utils/config.js'
import { ModelError } from '@/domain/exceptions/modelError.js'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse.js'
const messagesPath = path.join(__dirname, 'data', 'messages.json')
class MessagesModel {
  static async getAllMessages (): Promise<MessageType[]> {
    const data = await fs.readFile(messagesPath, 'utf-8')
    const messages: MessageType[] = JSON.parse(data)
    if (!messages) {
      throw new ModelError('No se pudieron encontrar los mensajes')
    }
    return messages.map(message => createMessage(message))
  }

  static async getAllMessagesByConversation (id: ID): Promise<MessageType[]> {
    const messages = await this.getAllMessages()
    const filteredMessages = messages.filter(
      message => message.conversation_id === id
    )
    if (!filteredMessages) {
      throw new ModelError('No se pudieron encontrar los mensajes')
    }
    // Return message with limited public information
    return filteredMessages.map(message => createMessage(message))
  }

  static async getMessageById (id: ID): Promise<MessageType> {
    const messages = await this.getAllMessages()
    const message = messages.find(message => message.id === id)
    if (!message) {
      throw new ModelError('No se pudo encontrar el mensaje')
    }
    // Return message with limited public information
    return createMessage(message)
  }

  static async sendMessage (data: Partial<MessageType>): Promise<MessageType> {
    const messages = await this.getAllMessages()
    // Crear valores por defecto
    const newMessage = createMessage(data)
    messages.push(newMessage)
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2))
    return newMessage
  }

  static async deleteMessage (id: ID): Promise<StatusResponseType> {
    const messages = await this.getAllMessages()
    const messageIndex = messages.findIndex(message => message.id === id)
    if (messageIndex === -1) {
      throw new ModelError('No se pudo encontrar el mensaje')
    }
    messages.splice(messageIndex, 1)
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2))
    return StatusResponse.success('Mensaje eliminado con éxito') // Mensaje de éxito
  }

  static async updateMessage (
    id: ID,
    data: Partial<MessageType>
  ): Promise<MessageType> {
    const messages = await this.getAllMessages()
    const messageIndex = messages.findIndex(message => message.id === id)
    if (messageIndex === -1) {
      throw new ModelError('No se pudo encontrar el mensaje')
    }
    // Actualiza los datos del usuario
    Object.assign(messages[messageIndex], data)
    // Hacer el path hacia aqui
    // const filePath = pat h.join()
    await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2))
    return messages[messageIndex]
  }
}

export { MessagesModel }
