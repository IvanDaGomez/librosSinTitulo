import { RequestHandler, Router } from 'express'
import { EmailsController } from '@/application/controllers/emails/emailsController.js'
import { EmailInterface } from '@/domain/interfaces/email.js'

export const createEmailsRouter = ({
  EmailsModel
}: {
  EmailsModel: EmailInterface
}) => {
  // Crear una instancia del controlador de emails
  const emailsController = new EmailsController({ EmailsModel })
  // Crear el router de emails
  const emailsRouter = Router()

  emailsRouter.get('/', emailsController.getAllEmails as RequestHandler) // R
  // emailsRouter.get('/safe', EmailsController.getAllEmailsSafe) // R
  emailsRouter.post('/', emailsController.createEmail as RequestHandler) // C
  emailsRouter.get(
    '/:email_id',
    emailsController.getEmailById as RequestHandler
  ) // R
  emailsRouter.delete('/:email', emailsController.deleteEmail as RequestHandler)

  return emailsRouter
}
