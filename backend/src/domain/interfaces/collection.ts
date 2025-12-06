import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface CollectionInterface {
  getAllCollections(): Promise<CollectionType[]>
  getCollectionById({ id }: { id: ID }): Promise<CollectionType>
  getCollectionsByUser({ id }: { id: ID }): Promise<CollectionType[]>
  createCollection({
    data
  }: {
    data: Partial<CollectionType>
  }): Promise<CollectionType>
  deleteCollection({ id }: { id: ID }): Promise<StatusResponseType>
  updateCollection({
    id,
    data
  }: {
    id: ID
    data: Partial<CollectionType>
  }): Promise<CollectionType>
  getCollectionByQuery({
    query,
    l,
    collections
  }: {
    query: string
    l: number
    collections?: CollectionType[]
  }): Promise<Partial<CollectionType>[]>
  getCollectionsByQueryWithFilters({
    query,
    where,
    l
  }: {
    query: string
    where: Record<string, string> | {}
    l: number
  }): Promise<Partial<CollectionType[]>>
  getCollectionSaga({
    book_id,
    user_id
  }: {
    book_id: ID
    user_id: ID
  }): Promise<CollectionType>
  forYouPageCollections({
    userKeyInfo,
    sampleSize
  }: {
    userKeyInfo: AuthToken | undefined
    sampleSize: number
  }): Promise<Partial<CollectionType>[]>
}
