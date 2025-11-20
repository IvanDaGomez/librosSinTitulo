import fs from 'node:fs/promises'
import { createConversation } from '@/domain/mappers/createConversation.js'
import { ConversationType } from '@/domain/entities/conversation'
import { ID } from '@/shared/types'
import { executeQuery, executeSingleResultQuery } from '@/utils/dbUtils.js'
import { pool } from '@/utils/config'
import { ModelError } from '@/domain/exceptions/modelError'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse'

// __dirname is not available in ES modules, so we need to use import.meta.url

export class ConversationsModel {
  static async getAllConversations (): Promise<ConversationType[]> {
    const data = await executeQuery<ConversationType>(
      pool,
      () => pool.query('SELECT * FROM conversations;'),
      'Error getting conversations'
    )
    return data
  }

  static async getConversationById (id: ID): Promise<ConversationType> {
    const conversation = await executeSingleResultQuery<ConversationType>(
      pool,
      () => pool.query('SELECT * FROM conversations WHERE id = $1;', [id]),
      'Error getting conversation'
    )
    if (!conversation) {
      throw new ModelError('Conversation not found')
    }
    // Return conversation with limited public information
    return conversation
  }

  static async getConversationsByList (
    conversationsIds: ID[]
  ): Promise<ConversationType[]> {
    // Load all conversations from the JSON file
    const conversations = await Promise.all(
      conversationsIds.map(id => {
        const conversation = this.getConversationById(id)
        return conversation
      })
    )
    return conversations
  }

  static async createConversation (
    data: Partial<ConversationType>
  ): Promise<ConversationType> {
    const fullConversation = createConversation(data)
    const newConversation = await executeSingleResultQuery<ConversationType>(
      pool,
      () =>
        pool.query(
          'INSERT INTO conversations (id, participants, messages_ids, last_message, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
          [
            fullConversation.id,
            fullConversation.participants,
            fullConversation.messages_ids,
            fullConversation.last_message,
            fullConversation.created_at,
            fullConversation.updated_at
          ]
        ),
      'Error creating conversation'
    )
    if (!newConversation) {
      throw new ModelError('Failed to create conversation')
    }
    return newConversation
  }

  static async deleteConversation (id: ID): Promise<StatusResponseType> {
    const conversation = await this.getConversationById(id)
    if (!conversation) {
      throw new ModelError('No se encontró la conversación')
    }
    await executeQuery(
      pool,
      () => pool.query('DELETE FROM conversations WHERE id = $1;', [id]),
      'Error deleting conversation'
    )
    return StatusResponse.success('Conversación eliminada con éxito')
  }

  static async updateConversation (
    id: ID,
    data: Partial<ConversationType>
  ): Promise<ConversationType> {
    try {
      const entries = Object.entries(data)
      const keys = entries.map(([key]) => key)
      const values = entries.map(([, value]) => value)

      const updateString = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ')
      const query = `UPDATE conversations SET ${updateString} WHERE id = $${
        keys.length + 1
      } RETURNING *;`
      const result = await executeSingleResultQuery<ConversationType>(
        pool,
        () => pool.query(query, [...values, id]),
        `Failed to update conversation with ID ${id}`
      )
      if (!result) {
        throw new ModelError('Failed to update conversation')
      }
      return result
    } catch (error) {
      throw new ModelError(`Error updating conversation with ID ${id}`)
    }
  }
}
