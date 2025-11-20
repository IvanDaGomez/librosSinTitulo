import fs from 'node:fs/promises'
import { createMessage } from '@/domain/mappers/createMessage.js'
import { MessageType } from '@/domain/entities/message.js'
import { ID } from '@/shared/types'
import { executeQuery, executeSingleResultQuery } from '@/utils/dbUtils.js'
import { pool } from '@/utils/config.js'
import { ModelError } from '@/domain/exceptions/modelError'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse'

// __dirname is not available in ES modules, so we need to use import.meta.url

class MessagesModel {
  static async getAllMessages (): Promise<MessageType[]> {
    try {
      const messages = await executeQuery<MessageType>(
        pool,
        () => pool.query('SELECT * FROM messages;'),
        'Failed to fetch books from database'
      )

      return messages
    } catch (error) {
      throw new ModelError('Error retrieving books')
    }
  }

  static async getAllMessagesByConversation (id: ID): Promise<MessageType[]> {
    const data = await executeQuery<MessageType>(
      pool,
      () =>
        pool.query('SELECT * FROM messages WHERE conversation_id = $1;', [id]),
      'Failed to fetch messages from PostgreSQL'
    )

    return data
  }

  static async getMessageById (id: ID): Promise<MessageType> {
    const messages = await executeSingleResultQuery<MessageType>(
      pool,
      () => pool.query('SELECT * FROM messages WHERE id = $1;', [id]),
      'Failed to fetch message from PostgreSQL'
    )
    if (!messages) {
      throw new ModelError('Message not found')
    }
    return messages
  }

  static async sendMessage (data: Partial<MessageType>): Promise<MessageType> {
    const message = createMessage(data)
    await executeQuery<MessageType>(
      pool,
      () =>
        pool.query(
          `INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, created_at, read, metadata) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            message.id,
            message.sender_id,
            message.receiver_id,
            message.conversation_id,
            message.content,
            message.created_at,
            message.read,
            message.metadata
          ]
        ),
      'Error creating message'
    )
    return message
  }

  static async deleteMessage (id: ID): Promise<StatusResponseType> {
    // Check if the message exists
    try {
      await executeQuery<MessageType>(
        pool,
        () => pool.query('DELETE FROM messages WHERE id = $1;', [id]),
        'Error deleting message'
      )
      return StatusResponse.success('Message deleted successfully') // Mensaje de éxito
    } catch (error) {
      throw new ModelError(`Error deleting message with ID ${id}`)
    }
  }

  static async updateMessage (
    id: ID,
    data: Partial<MessageType>
  ): Promise<MessageType> {
    try {
      const [keys, values] = Object.entries(data)
      const updateString = keys.reduce((last, key, index) => {
        const prefix = index === 0 ? '' : ', '
        return `${last}${prefix}${key} = $${index + 1}`
      })

      const result = await executeSingleResultQuery<MessageType>(
        pool,
        () =>
          pool.query(
            `UPDATE messages SET ${updateString} WHERE id = $${
              keys.length + 1
            } RETURNING *;`,
            [...values, id]
          ),
        `Failed to update message with ID ${id}`
      )
      if (!result) {
        throw new ModelError('Message not found')
      }
      return result
    } catch (error) {
      throw new ModelError(`Error updating message with ID ${id}`)
    }
  }
  static async getMessagesByQuery (query: string): Promise<MessageType[]> {
    try {
      const messages = await executeQuery<MessageType>(
        pool,
        () =>
          pool.query('SELECT * FROM messages WHERE message ILIKE $1;', [
            `%${query}%`
          ]),
        'Failed to fetch messages by query from PostgreSQL'
      )
      return messages
    } catch (error) {
      throw new ModelError('Error retrieving messages by query')
    }
  }
}

export { MessagesModel }
