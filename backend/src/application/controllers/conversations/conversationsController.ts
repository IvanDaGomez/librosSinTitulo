import express from 'express'
import { ID } from '@/shared/types'
import { ConversationType } from '@/domain/entities/conversation.js'
import { ConversationInterface } from '@/domain/interfaces/conversation.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { ConversationService } from '@/application/services/conversations/conversationService.js'
import { UserService } from '@/application/services/users/userService.js'
import { ApiResponse } from '@/domain/valueObjects/apiResponse.js'
export class ConversationsController {
  conversationService: ConversationInterface
  userService: UserInterface

  constructor ({
    ConversationsModel,
    UsersModel
  }: {
    ConversationsModel: ConversationInterface
    UsersModel: UserInterface
  }) {
    this.conversationService = new ConversationService(ConversationsModel)
    this.userService = new UserService(UsersModel)
  }

  getAllConversations = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { l } = req.query
      const lParsed = parseInt(l as string, 10) ?? 0 // If 0 no limit is set
      const conversations = await this.conversationService.getAllConversations(
        lParsed
      )

      res.json(ApiResponse.success(conversations))
    } catch (err) {
      next(err)
    }
  }

  getConversationsByUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const userId = req.params.user_id as ID

      const user = await this.userService.getUserById(userId)
      const conversations =
        await this.conversationService.getConversationsByList(
          user.conversations_ids
        )

      res.json(ApiResponse.success(conversations))
    } catch (err) {
      next(err)
    }
  }

  getConversationById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const conversationId = req.params.conversation_id as ID
      const conversation = await this.conversationService.getConversationById(
        conversationId
      )
      res.json(ApiResponse.success(conversation))
    } catch (err) {
      next(err)
    }
  }

  // Filtrar mensajes
  createConversation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const data = req.body as ConversationType
      console.log('data', data)
      // Validation: Ensure exactly two users
      if (data.participants.length !== 2) {
        return res
          .status(400)
          .json(ApiResponse.error('Es necesario dos usuarios', 400))
      }

      // Check if conversation already exists
      const conversations = await this.conversationService.getAllConversations()
      if (
        conversations.some(
          conversation =>
            JSON.stringify(conversation.participants) ===
            JSON.stringify(data.participants)
        )
      ) {
        return res
          .status(400)
          .json(ApiResponse.error('Conversación ya agregada', 400))
      }

      // Create conversation in the database first
      const conversation = await this.conversationService.createConversation(
        data
      )

      // Only update users' conversation IDs after successful creation
      for (const userId of data.participants) {
        const user = await this.userService.getUserById(userId)

        user.conversations_ids = [...user.conversations_ids, conversation.id]
        await this.userService.updateUser(user.id, user)
      }

      return res.json(ApiResponse.success(conversation))
    } catch (err) {
      next(err)
    }
  }

  deleteConversation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const conversationId = req.params.conversation_id as ID

      // Obtener los detalles de la conversación para encontrar al vendedor Eliminar conversacionesIds
      const conversation = await this.conversationService.getConversationById(
        conversationId
      )

      // Necesario actualizar el usuario en la que la conversación se elimina
      // Iterate through users with a for...of loop for async handling
      for (const userId of conversation.participants) {
        const user = await this.userService.getUserById(userId)
        // Assign conversation ID to user's conversationsIds
        user.conversations_ids = user.conversations_ids.filter(
          id => id !== conversationId
        )
        await this.userService.updateUser(user.id, user)
      }

      // Eliminar el mensaje de la base de datos
      await this.conversationService.deleteConversation(conversationId)

      res.json(
        ApiResponse.success({ message: 'Conversación eliminada con éxito' })
      )
    } catch (err) {
      next(err)
    }
  }
}
