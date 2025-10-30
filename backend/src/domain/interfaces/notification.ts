export interface NotificationInterface {
  getAllNotifications(l?: number): Promise<NotificationType[]>
  getAllNotificationsByUserId(user_id: ID): Promise<NotificationType[]>
  getNotificationById(id: ID): Promise<NotificationType>
  createNotification(data: Partial<NotificationType>): Promise<NotificationType>
  updateNotification(
    id: ID,
    data: Partial<NotificationType>
  ): Promise<NotificationType>
  deleteNotification(id: ID): Promise<{ message: string }>
  markNotificationAsRead(id: ID): Promise<NotificationType>
}
