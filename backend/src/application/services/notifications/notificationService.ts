import { NotificationType } from '@/domain/entities/notification'
import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'
import { ServiceError } from '@/domain/exceptions/serviceError'
import { NotificationInterface } from '@/domain/interfaces/notification'

export class NotificationService implements NotificationInterface {
  private notificationsModel: NotificationInterface

  constructor (notificationsModel: NotificationInterface) {
    this.notificationsModel = notificationsModel
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

  getAllNotifications (l?: number): Promise<NotificationType[]> {
    if (l !== undefined && l < 1) l = 10
    return this.handle(
      () => this.notificationsModel.getAllNotifications(l),
      'Error getting all notifications'
    )
  }

  getAllNotificationsByUserId (user_id: ID): Promise<NotificationType[]> {
    return this.handle(
      () => this.notificationsModel.getAllNotificationsByUserId(user_id),
      `Error getting notifications for user id: ${user_id}`
    )
  }

  getNotificationById (id: ID): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.getNotificationById(id),
      `Error getting notification with id: ${id}`
    )
  }

  createNotification (
    data: Partial<NotificationType>
  ): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.createNotification(data),
      'Error creating notification'
    )
  }

  updateNotification (
    id: ID,
    data: Partial<NotificationType>
  ): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.updateNotification(id, data),
      `Error updating notification with id: ${id}`
    )
  }

  deleteNotification (id: ID): Promise<StatusResponseType> {
    return this.handle(
      () => this.notificationsModel.deleteNotification(id),
      `Error deleting notification with id: ${id}`
    )
  }

  markNotificationAsRead (id: ID): Promise<NotificationType> {
    return this.handle(
      () => this.notificationsModel.markNotificationAsRead(id),
      `Error marking notification as read with id: ${id}`
    )
  }
}
