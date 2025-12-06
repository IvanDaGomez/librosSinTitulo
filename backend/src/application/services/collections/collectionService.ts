import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { CollectionInterface } from '@/domain/interfaces/collection.js'

export class CollectionService implements CollectionInterface {
  private collectionsModel: CollectionInterface

  constructor (collectionsModel: CollectionInterface) {
    this.collectionsModel = collectionsModel
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

  getAllCollections (): Promise<CollectionType[]> {
    return this.handle(
      () => this.collectionsModel.getAllCollections(),
      'Error getting all collections'
    )
  }

  getCollectionById ({ id }: { id: ID }): Promise<CollectionType> {
    return this.handle(
      () => this.collectionsModel.getCollectionById({ id }),
      `Error getting collection with id: ${id}`
    )
  }

  getCollectionsByUser ({ id }: { id: ID }): Promise<CollectionType[]> {
    return this.handle(
      () => this.collectionsModel.getCollectionsByUser({ id }),
      `Error getting collections by user id: ${id}`
    )
  }

  createCollection ({
    data
  }: {
    data: Partial<CollectionType>
  }): Promise<CollectionType> {
    return this.handle(
      () => this.collectionsModel.createCollection({ data }),
      'Error creating collection'
    )
  }

  deleteCollection ({ id }: { id: ID }): Promise<StatusResponseType> {
    return this.handle(
      () => this.collectionsModel.deleteCollection({ id }),
      `Error deleting collection with id: ${id}`
    )
  }

  updateCollection ({
    id,
    data
  }: {
    id: ID
    data: Partial<CollectionType>
  }): Promise<CollectionType> {
    return this.handle(
      () => this.collectionsModel.updateCollection({ id, data }),
      `Error updating collection with id: ${id}`
    )
  }

  getCollectionByQuery ({
    query,
    l,
    collections
  }: {
    query: string
    l: number
    collections?: CollectionType[]
  }): Promise<Partial<CollectionType>[]> {
    if (l < 1) l = 10
    return this.handle(
      () =>
        this.collectionsModel.getCollectionByQuery({ query, l, collections }),
      `Error getting collections by query: ${query}`
    )
  }

  getCollectionsByQueryWithFilters (query: {
    query: string
    where: Record<string, string> | {}
    l: number
  }): Promise<Partial<CollectionType[]>> {
    if (query.l < 1) query.l = 10
    return this.handle(
      () => this.collectionsModel.getCollectionsByQueryWithFilters(query),
      `Error getting collections by query with filters: ${query.query}`
    )
  }

  getCollectionSaga ({
    book_id,
    user_id
  }: {
    book_id: ID
    user_id: ID
  }): Promise<CollectionType> {
    return this.handle(
      () => this.collectionsModel.getCollectionSaga({ book_id, user_id }),
      `Error getting collection saga for book: ${book_id} and user: ${user_id}`
    )
  }

  forYouPageCollections ({
    userKeyInfo,
    sampleSize
  }: {
    userKeyInfo: AuthToken | undefined
    sampleSize: number
  }): Promise<Partial<CollectionType>[]> {
    return this.handle(
      () =>
        this.collectionsModel.forYouPageCollections({
          userKeyInfo,
          sampleSize
        }),
      'Error getting for you page collections'
    )
  }
}
