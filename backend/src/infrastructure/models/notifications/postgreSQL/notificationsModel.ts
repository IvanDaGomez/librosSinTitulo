import { createNotification } from '@/domain/mappers/createNotification'
import { NotificationType } from '@/domain/entities/notification'
import { ID } from '@/shared/types'
import {
  DatabaseError,
  executeQuery,
  executeSingleResultQuery
} from '@/utils/dbUtils'
import { pool } from '@/utils/config.js'
import { ModelError } from '@/domain/exceptions/modelError'

export class NotificationsModel {
  static async getAllNotifications (): Promise<NotificationType[]> {
    // Delete expired notifications
    await executeQuery(
      pool,
      () => pool.query('DELETE FROM notifications WHERE expires_at < NOW();'),
      'Error deleting expired notifications'
    )

    const notifications: NotificationType[] = await executeQuery(
      pool,
      () => pool.query('SELECT * FROM notifications;'),
      'Error getting notifications'
    )
    return notifications
  }

  static async getAllNotificationsByUserId (
    userId: ID
  ): Promise<NotificationType[]> {
    // Load all notifications from the JSON file
    const notifications = await executeQuery(
      pool,
      () =>
        pool.query('SELECT * FROM notifications WHERE user_id = $1;', [userId]),
      'Error getting notifications'
    )
    return notifications
  }

  static async getNotificationById (id: ID): Promise<NotificationType> {
    const notification = await executeSingleResultQuery<NotificationType>(
      pool,
      () => pool.query('SELECT * FROM notifications WHERE id = $1;', [id]),
      `Failed to fetch notification with ID ${id}`
    )
    if (!notification) {
      throw new ModelError(`Notification with ID ${id} not found`)
    }
    return notification
  }

  static async createNotification (
    data: Partial<NotificationType>
  ): Promise<NotificationType> {
    const newNotification = createNotification(data)
    await executeSingleResultQuery<NotificationType>(
      pool,
      () =>
        pool.query(
          'INSERT INTO notifications (id, user_id, type, title, body, action_url, read, created_at, priority, expires_at, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);',
          [
            newNotification.id,
            newNotification.user_id,
            newNotification.type,
            newNotification.title,
            newNotification.body,
            newNotification.action_url,
            newNotification.read,
            newNotification.created_at,
            newNotification.priority,
            newNotification.expires_at,
            JSON.stringify(newNotification.metadata)
          ]
        ),
      'Error creating notification'
    )
    return newNotification
  }

  static async deleteNotification (id: ID): Promise<{ message: string }> {
    await executeQuery(
      pool,
      () => pool.query('DELETE FROM notifications WHERE id = $1;', [id]),
      'Error deleting notification'
    )
    return { message: 'Notificación eliminada con éxito' } // Mensaje de éxito
  }

  static async updateNotification (
    id: ID,
    data: Partial<NotificationType>
  ): Promise<NotificationType> {
    try {
      const [keys, values] = Object.entries(data)
      const updateString = keys.reduce((last, key, index) => {
        const prefix = index === 0 ? '' : ', '
        return `${last}${prefix}${key} = $${index + 1}`
      })

      const result = await executeSingleResultQuery(
        pool,
        () =>
          pool.query(
            `UPDATE notifications SET ${updateString} WHERE id = $${
              keys.length + 1
            } RETURNING *;`,
            [...values, id]
          ),
        `Failed to update book with ID ${id}`
      )

      return result
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Error updating book with ID ${id}`, error)
    }
  }

  static async markNotificationAsRead (id: ID): Promise<NotificationType> {
    const notification: NotificationType = await executeSingleResultQuery(
      pool,
      () =>
        pool.query(
          'UPDATE notifications SET read = true WHERE id = $1 RETURNING *;',
          [id]
        ),
      'Error marking notification as read'
    )
    return notification
  }
}
