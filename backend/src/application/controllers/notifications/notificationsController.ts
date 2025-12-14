import { validateNotification } from '@/utils/validate.js'
import express from 'express'
import { ID } from '@/shared/types'
import { NotificationType } from '@/domain/entities/notification.js'
import { NotificationInterface } from '@/domain/interfaces/notification.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import { NotificationService } from '@/application/services/notifications/notificationService.js'
import { UserService } from '@/application/services/users/userService.js'
export class NotificationsController {
  notificationService: NotificationInterface
  userService: UserInterface
  constructor ({
    NotificationsModel,
    UsersModel
  }: {
    NotificationsModel: NotificationInterface
    UsersModel: UserInterface
  }) {
    this.userService = new UserService({ usersModel: UsersModel })
    this.notificationService = new NotificationService({
      notificationsModel: NotificationsModel,
      userService: this.userService
    })
  }

  getAllNotifications = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const notifications = await this.notificationService.getAllNotifications()
      res.json(notifications)
    } catch (err) {
      next(err)
    }
  }

  getAllNotificationsByUserId = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.user_id as ID | undefined
      if (!userId) {
        return res.status(404).json({ error: 'Es necesario un usuario' })
      }
      const notifications =
        await this.notificationService.getAllNotificationsByUserId({
          user_id: userId
        })
      res.json(notifications)
    } catch (err) {
      next(err)
    }
  }

  getNotificationById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const notificationId = req.params.notification_id as ID | undefined
      if (!notificationId) {
        return res.status(404).json({ error: 'Es necesario un ID' })
      }
      const notifications = await this.notificationService.getNotificationById({
        id: notificationId
      })

      res.json(notifications)
    } catch (err) {
      next(err)
    }
  }

  markNotificationAsRead = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const notificationId = req.params.notification_id as ID | undefined
      if (!notificationId) {
        return res.status(404).json({ error: 'No hay ID de notificación' })
      }
      await this.notificationService.markNotificationAsRead({
        id: notificationId
      })

      res.json({ message: 'Notificación marcada como leída' })
    } catch (err) {
      next(err)
    }
  }

  createNotification = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const data = req.body as NotificationType

      // Validación
      const validated = validateNotification(data)
      if (!validated.success) {
        return res.status(400).json({ error: validated.error })
      }

      // Service handles ID generation and user update
      const notification = await this.notificationService.createNotification({
        data
      })

      res.json(notification)
    } catch (err) {
      next(err)
    }
  }

  deleteNotification = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const notificationId = req.params.notification_id as ID | undefined
      if (!notificationId) {
        return res.status(404).json({ error: 'Es necesario un ID' })
      }

      // Service handles user notification_ids cleanup
      await this.notificationService.deleteNotification({ id: notificationId })

      res.json({ message: 'Notificacion eliminada con éxito' })
    } catch (err) {
      next(err)
    }
  }
}
