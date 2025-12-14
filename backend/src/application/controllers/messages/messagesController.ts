import { validateMessage } from '@/utils/validate.js'
import express from 'express'
import { ID } from '@/shared/types'
import { MessageType } from '@/domain/entities/message.js'
import { ConversationInterface } from '@/domain/interfaces/conversation.js'
import { MessageInterface } from '@/domain/interfaces/message.js'
import { MessageService } from '@/application/services/messages/messageService.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'
import { createMessage } from '@/domain/mappers/createMessage.js'
import { ConversationService } from '@/application/services/conversations/conversationService.js'
export class MessagesController {
  messageService: MessageInterface
  conversationService: ConversationInterface
  constructor ({
    MessagesModel,
    ConversationsModel
  }: {
    MessagesModel: MessageInterface
    ConversationsModel: ConversationInterface
  }) {
    this.conversationService = new ConversationService({
      conversationsModel: ConversationsModel
    })
    this.messageService = new MessageService({
      messagesModel: MessagesModel,
      conversationService: this.conversationService
    })
  }

  getAllMessages = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const messages = await this.messageService.getAllMessages()
      res.json(messages)
    } catch (err) {
      next(err)
    }
  }

  getAllMessagesByConversation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const conversationId = req.params.conversation_id as ID | undefined
      if (!conversationId) {
        return res
          .status(400)
          .json(ApiResponse.error('ID de conversación no proporcionado', 400))
      }
      const message = await this.messageService.getAllMessagesByConversation({
        id: conversationId
      })
      res.json(message)
    } catch (err) {
      next(err)
    }
  }

  getMessageById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const messageId = req.params.message_id as ID | undefined
      if (!messageId) {
        return res
          .status(400)
          .json(ApiResponse.error('ID de mensaje no proporcionado', 400))
      }
      const message = await this.messageService.getMessageById({
        id: messageId
      })
      res.json(message)
    } catch (err) {
      next(err)
    }
  }

  // Filtrar mensajes
  sendMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const data = req.body
    const parsedData = createMessage(data)
    try {
      const validated = validateMessage(data)
      if (!validated.success) {
        console.dir(validated.error, { depth: null })
        return res
          .status(400)
          .json(ApiResponse.error(String(validated.error), 400))
      }

      // Service handles conversation validation and update
      const message = await this.messageService.sendMessage({ data: parsedData })

      res.json(message)
    } catch (err) {
      next(err)
    }
  }

  deleteMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const messageId = req.params.message_id as ID | undefined
      if (!messageId) {
        return res
          .status(400)
          .json(ApiResponse.error('ID de mensaje no proporcionado', 400))
      }
      // Eliminar el mensaje de la base de datos
      await this.messageService.deleteMessage({ id: messageId })

      res.json({ message: 'Mensaje eliminado con éxito' })
    } catch (err) {
      next(err)
    }
  }

  markAsRead = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const messageId = req.params.message_id as ID | undefined
      if (!messageId) {
        return res
          .status(400)
          .json(ApiResponse.error('ID de mensaje no proporcionado', 400))
      }

      await this.messageService.updateMessage({
        id: messageId,
        data: { read: true }
      })

      res.json({ message: 'Mensaje actualizado con éxito' })
    } catch (err) {
      next(err)
    }
  }
  getMessagesByQuery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const query = req.params.query as string | undefined
      if (!query) {
        return res
          .status(400)
          .json(ApiResponse.error('Consulta no proporcionada', 400))
      }
      const messages = await this.messageService.getMessagesByQuery({ query })
      res.json(messages)
    } catch (err) {
      next(err)
    }
  }
}
