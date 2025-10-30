import { CollectionType } from '@/domain/entities/collection'
import { ID } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken'

export interface CollectionInterface {
  getAllCollections(): Promise<CollectionType[]>
  getCollectionById(id: ID): Promise<CollectionType>
  getCollectionsByUser(id: ID): Promise<CollectionType[]>
  createCollection(data: Partial<CollectionType>): Promise<CollectionType>
  deleteCollection(id: ID): Promise<{ message: string }>
  updateCollection(
    id: ID,
    data: Partial<CollectionType>
  ): Promise<CollectionType>
  getCollectionByQuery(
    query: string,
    l: number,
    collections?: CollectionType[]
  ): Promise<Partial<CollectionType>[]>
  getCollectionsByQueryWithFilters(query: {
    query: string
    where: Record<string, string> | {}
    l: number
  }): Promise<CollectionType[]>
  getCollectionSaga(book_id: ID, user_id: ID): Promise<CollectionType>
  forYouPageCollections(
    userKeyInfo: AuthToken | undefined,
    sampleSize: number
  ): Promise<Partial<CollectionType>[]>
}
