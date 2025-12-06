import { NotificationType } from '@/domain/entities/notification.js'
import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface NotificationInterface {
  getAllNotifications({ l }: { l?: number }): Promise<NotificationType[]>
  getAllNotificationsByUserId({
    user_id
  }: {
    user_id: ID
  }): Promise<NotificationType[]>
  getNotificationById({ id }: { id: ID }): Promise<NotificationType>
  createNotification({
    data
  }: {
    data: Partial<NotificationType>
  }): Promise<NotificationType>
  updateNotification({
    id,
    data
  }: {
    id: ID
    data: Partial<NotificationType>
  }): Promise<NotificationType>
  deleteNotification({ id }: { id: ID }): Promise<StatusResponseType>
  markNotificationAsRead({ id }: { id: ID }): Promise<NotificationType>
}
