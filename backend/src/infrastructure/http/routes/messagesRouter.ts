import { RequestHandler, Router } from 'express'
// import { upload } from '../../assets/config.js'
import { MessagesController } from '@/application/controllers/messages/messagesController.js'
import { MessageInterface } from '@/domain/interfaces/message.js'
import { ConversationInterface } from '@/domain/interfaces/conversation.js'
export const createMessagesRouter = ({
  MessagesModel,
  ConversationsModel
}: {
  MessagesModel: MessageInterface
  ConversationsModel: ConversationInterface
}) => {
  // Crear una instancia del controlador de mensajes
  const messagesController = new MessagesController({
    MessagesModel,
    ConversationsModel
  })
  const messagesRouter = Router()

  // Rutas de mensajes
  messagesRouter.get('/', messagesController.getAllMessages as RequestHandler) // Obtener todos los mensajes
  messagesRouter.get(
    '/query/:query',
    messagesController.getMessagesByQuery as RequestHandler
  ) // Obtener mensajes por consulta
  messagesRouter.get(
    '/messageByConversation/:conversation_id',
    messagesController.getAllMessagesByConversation as RequestHandler
  )
  messagesRouter.get(
    '/messageById/:message_id',
    messagesController.getMessageById as RequestHandler
  ) // Obtener un mensaje específico
  messagesRouter.post('/', messagesController.sendMessage as RequestHandler) // Enviar un nuevo mensaje
  messagesRouter.delete(
    '/:message_id',
    messagesController.deleteMessage as RequestHandler
  ) // Eliminar un mensaje específico
  messagesRouter.post(
    '/:message_id/read',
    messagesController.markAsRead as RequestHandler
  ) // Marcar mensaje como leído

  return messagesRouter
}
