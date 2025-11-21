import { createCollection } from '@/domain/mappers/createCollection.js'
import { calculateMatchScore } from '@/utils/calculateMatchScore.js'
import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { changeToArray } from '@/utils/changeToArray.js'
import { pool } from '@/utils/config.js'
import { executeQuery, executeSingleResultQuery } from '@/utils/dbUtils.js'
import { ModelError } from '@/domain/exceptions/modelError.js'
import { CollectionInterface } from '@/domain/interfaces/collection.js'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse.js'

// __dirname is not available in ES modules, so we need to use import.meta.url

class CollectionsModel {
  static async getAllCollections (): Promise<CollectionType[]> {
    const data = await executeQuery<CollectionType>(
      pool,
      () => pool.query('SELECT * FROM collections;'),
      'Failed to fetch collections from PostgreSQL'
    )
    return data
  }

  static async getCollectionById (id: ID): Promise<CollectionType> {
    const data = await executeSingleResultQuery<CollectionType>(
      pool,
      () => pool.query('SELECT * FROM collections WHERE id = $1;', [id]),
      'Failed to fetch collection from PostgreSQL'
    )
    if (!data) {
      throw new ModelError('No se encontró la colección')
    }
    return data
  }

  static async getCollectionsByUser (id: ID): Promise<CollectionType[]> {
    const data = await executeQuery<CollectionType>(
      pool,
      () => pool.query('SELECT * FROM collections WHERE user_id = $1;', [id]),
      'Failed to fetch collection from PostgreSQL'
    )

    return data
  }

  static async createCollection (
    data: Partial<CollectionType>
  ): Promise<CollectionType> {
    const fullCollecion = createCollection(data)
    const newCollection = await executeSingleResultQuery<CollectionType>(
      pool,
      () =>
        pool.query(
          `INSERT INTO collections (id, photo, books_ids, name, description, followers, user_id, saga, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
          [
            fullCollecion.id,
            fullCollecion.photo,
            fullCollecion.books_ids,
            fullCollecion.name,
            fullCollecion.description,
            fullCollecion.followers,
            fullCollecion.user_id,
            fullCollecion.saga,
            fullCollecion.created_at
          ]
        ),
      'Failed to create collection in PostgreSQL'
    )
    if (!newCollection) {
      throw new ModelError('No se pudo crear la colección')
    }
    return newCollection
  }

  static async deleteCollection (id: ID): Promise<StatusResponseType> {
    const collection = await this.getCollectionById(id)

    await executeQuery(
      pool,
      () => pool.query('DELETE FROM collections WHERE id = $1;', [id]),
      'Failed to delete collection from PostgreSQL'
    )
    return StatusResponse.success('Colección eliminada con éxito') // Mensaje de éxito
  }

  static async updateCollection (
    id: ID,
    data: Partial<CollectionType>
  ): Promise<CollectionType> {
    try {
      const keys = Object.keys(data)
      const values = Object.values(data)
      let updateString = ''
      for (const i of keys) {
        updateString += `${i} = $${keys.indexOf(i) + 1}, `
      }
      updateString = updateString.slice(0, -2) // Remove last comma and space

      const result = await executeSingleResultQuery(
        pool,
        () =>
          pool.query(
            `UPDATE collections SET ${updateString} WHERE ID = $${
              keys.length + 1
            } RETURNING *;`,
            [...values, id]
          ),
        `Failed to update book with ID ${id}`
      )

      return result
    } catch (error) {
      throw new ModelError(`Error updating book with ID ${id}`)
    }
  }

  // Pendiente desarrollar, una buena query para buscar varios patrones
  static async getCollectionByQuery (
    query: string,
    l: number = 24,
    collections: CollectionType[] = []
  ): Promise<CollectionType[]> {
    if (collections.length === 0) {
      collections = await executeQuery<CollectionType>(
        pool,
        () =>
          pool.query(`SELECT * FROM collections ORDER BY RANDOM() LIMIT $1;`, [
            l
          ]),
        'Failed to fetch collections from database'
      )
    }

    const queryWords = changeToArray(query)

    const collectionsWithScores = collections
      .map(collection => {
        const score = calculateMatchScore(collection, queryWords, query)

        // Umbral de coincidencia deseado
        if (score < queryWords.length * 0.7) return null

        return { collection, score } // Devolvemos el libro junto con su puntaje si pasa la validación
      })
      .filter(item => item !== null)

    // Ordenamos los libros por el puntaje en orden descendente
    const filteredCollections = collectionsWithScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.collection)

    return filteredCollections
  }

  static async getCollectionsByQueryWithFilters (query: {
    query: string
    where: Record<string, string> | {}
    l: number
  }): Promise<CollectionType[]> {
    let collections = await executeQuery<CollectionType>(
      pool,
      () =>
        pool.query(`SELECT * FROM collections ORDER BY RANDOM() LIMIT $1;`, [
          query.l
        ]),
      'Failed to fetch collections from database'
    )
    if (Object.keys(query.where).length === 0)
      throw new Error('No se encontraron colecciones para este usuario')
    collections = collections.filter(collection => {
      return Object.keys(query.where).some(filter => {
        const key = filter as keyof CollectionType
        return (
          collection[key] === (query.where as Record<string, string>)[filter]
        )
      })
    })

    // Perform search based on the query
    collections = await this.getCollectionByQuery(
      query.query,
      query.l,
      collections
    )
    if (collections === undefined || !collections) {
      throw new Error('No se encontraron colecciones para este usuario')
    }
    return collections
  }

  static async getCollectionSaga (
    bookId: ID,
    userId: ID
  ): Promise<CollectionType> {
    const collection = await executeSingleResultQuery<CollectionType>(
      pool,
      () =>
        pool.query(
          'SELECT * FROM collections WHERE user_id = $1 AND libros_ids @> $2 AND saga = true;',
          [userId, [bookId]]
        ),
      'Failed to fetch collection from PostgreSQL'
    )
    if (!collection) {
      throw new Error('No se encontró la colección')
    }
    return collection
  }
  static async forYouPageCollections (
    userKeyInfo: any,
    sampleSize: number = 24
  ): Promise<CollectionType[]> {
    const collections = await executeQuery<CollectionType>(
      pool,
      () =>
        pool.query(
          `SELECT * FROM collections WHERE user_id != $1 ORDER BY RANDOM() LIMIT $2;`,
          [userKeyInfo?.id ?? '0', sampleSize]
        ),
      'Failed to fetch collections from PostgreSQL'
    )
    return collections
  }
}

export { CollectionsModel }
