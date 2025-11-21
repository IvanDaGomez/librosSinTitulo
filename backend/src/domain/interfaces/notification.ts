import { NotificationType } from '@/domain/entities/notification.js'
import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface NotificationInterface {
  getAllNotifications(l?: number): Promise<NotificationType[]>
  getAllNotificationsByUserId(user_id: ID): Promise<NotificationType[]>
  getNotificationById(id: ID): Promise<NotificationType>
  createNotification(data: Partial<NotificationType>): Promise<NotificationType>
  updateNotification(
    id: ID,
    data: Partial<NotificationType>
  ): Promise<NotificationType>
  deleteNotification(id: ID): Promise<StatusResponseType>
  markNotificationAsRead(id: ID): Promise<NotificationType>
}
