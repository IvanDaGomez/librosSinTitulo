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
    this.messageService = new MessageService(MessagesModel)
    this.conversationService = new ConversationService(ConversationsModel)
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
      const message = await this.messageService.getAllMessagesByConversation(
        conversationId
      )
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
      const message = await this.messageService.getMessageById(messageId)
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

      // Necesario actualizar la conversación en la que el mensaje se envía
      const conversation = await this.conversationService.getConversationById(
        parsedData.conversation_id
      )
      // Validar el userId
      if (!conversation.participants.includes(parsedData.sender_id)) {
        return res
          .status(404)
          .json(
            ApiResponse.error(
              'El usuario no se encuentra en la conversación',
              404
            )
          )
      }
      conversation.last_message = parsedData
      await this.conversationService.updateConversation(
        conversation.id,
        conversation
      )

      const message = await this.messageService.sendMessage(data)

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
      await this.messageService.deleteMessage(messageId)

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

      await this.messageService.updateMessage(messageId, { read: true })

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
      const messages = await this.messageService.getMessagesByQuery(query)
      res.json(messages)
    } catch (err) {
      next(err)
    }
  }
}
