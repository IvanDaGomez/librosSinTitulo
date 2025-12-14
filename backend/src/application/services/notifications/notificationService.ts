import { NotificationType } from '@/domain/entities/notification.js'
import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { NotificationInterface } from '@/domain/interfaces/notification.js'
import { UserInterface } from '@/domain/interfaces/user.js'

export class NotificationService implements NotificationInterface {
  private notificationsModel: NotificationInterface
  private userService?: UserInterface

  constructor ({
    notificationsModel,
    userService
  }: {
    notificationsModel: NotificationInterface
    userService?: UserInterface
  }) {
    this.notificationsModel = notificationsModel
    this.userService = userService
  }

  private async handle<T> (fn: () => Promise<T>, message: string): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      throw new ServiceError(
        message,
        error instanceof ServiceError ? error.statusCode : 500,
        error instanceof Error ? error.stack : undefined
      )
    }
  }

  getAllNotifications ({ l }: { l?: number }): Promise<NotificationType[]> {
    if (!l || l < 1) l = 10
    return this.handle(
      () => this.notificationsModel.getAllNotifications({ l }),
      'Error getting all notifications'
    )
  }

  getAllNotificationsByUserId ({
    user_id
  }: {
    user_id: ID
  }): Promise<NotificationType[]> {
    return this.handle(
      () => this.notificationsModel.getAllNotificationsByUserId({ user_id }),
      `Error getting notifications for user id: ${user_id}`
    )
  }

  getNotificationById ({ id }: { id: ID }): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.getNotificationById({ id }),
      `Error getting notification with id: ${id}`
    )
  }

  async createNotification ({
    data
  }: {
    data: Partial<NotificationType>
  }): Promise<NotificationType> {
    return this.handle(async () => {
      // Generate ID if not provided
      if (!data.id) {
        data.id = crypto.randomUUID() as ID
      }

      // Create notification
      const notification = await this.notificationsModel.createNotification({
        data
      })

      // Update user's notification_ids if userService is available
      if (this.userService && data.user_id) {
        const user = await this.userService.getUserById({ id: data.user_id })
        await this.userService.updateUser({
          id: user.id,
          data: {
            notifications_ids: [...user.notifications_ids, data.id]
          }
        })
      }

      return notification
    }, 'Error creating notification')
  }

  updateNotification ({
    id,
    data
  }: {
    id: ID
    data: Partial<NotificationType>
  }): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.updateNotification({ id, data }),
      `Error updating notification with id: ${id}`
    )
  }

  async deleteNotification ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(async () => {
      // Get notification to find associated user
      const notification = await this.notificationsModel.getNotificationById({
        id
      })

      // Update user's notification_ids if userService is available
      if (this.userService && notification.user_id) {
        const user = await this.userService.getUserById({
          id: notification.user_id
        })
        const updatedNotificationsIds = user.notifications_ids.filter(
          notifId => notifId !== id
        )
        await this.userService.updateUser({
          id: user.id,
          data: {
            notifications_ids: updatedNotificationsIds
          }
        })
      }

      // Delete the notification
      return await this.notificationsModel.deleteNotification({ id })
    }, `Error deleting notification with id: ${id}`)
  }

  markNotificationAsRead ({ id }: { id: ID }): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.markNotificationAsRead({ id }),
      `Error marking notification as read with id: ${id}`
    )
  }
}
