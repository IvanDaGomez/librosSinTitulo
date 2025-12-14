import { CollectionType } from '@/domain/entities/collection.js'
import { ID } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken.js'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'
import { ServiceError } from '@/domain/exceptions/serviceError.js'
import { CollectionInterface } from '@/domain/interfaces/collection.js'
import { BookInterface } from '@/domain/interfaces/book.js'
import { BookType } from '@/domain/entities/book.js'

export class CollectionService implements CollectionInterface {
  private collectionsModel: CollectionInterface
  private bookService?: BookInterface

  constructor ({
    collectionsModel,
    bookService
  }: {
    collectionsModel: CollectionInterface
    bookService?: BookInterface
  }) {
    this.collectionsModel = collectionsModel
    this.bookService = bookService
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

  async addBooksToCollection ({
    booksIds,
    collectionId
  }: {
    booksIds: ID[]
    collectionId: ID
  }): Promise<StatusResponseType> {
    return this.handle(async () => {
      if (!this.bookService) {
        throw new ServiceError(
          'Book service not available for this operation',
          500
        )
      }

      // Fetch books and collection
      let books = await this.bookService.getBooksByIdList({
        list: booksIds,
        l: 24
      })
      const collection = await this.collectionsModel.getCollectionById({
        id: collectionId
      })

      // Filter books to ensure they're not already in the collection
      books = books.filter(
        b =>
          !b.collections_ids?.includes(collectionId) &&
          !collection.books_ids?.includes(b.id as ID)
      ) as BookType[]

      // Ensure unique IDs in the collection
      const newCollectionList = [
        ...new Set([...collection.books_ids, ...books.map(b => b.id as ID)])
      ]

      // Update collection and books
      await Promise.all([
        this.collectionsModel.updateCollection({
          id: collectionId,
          data: {
            books_ids: newCollectionList as ID[]
          }
        }),
        ...books.map(b => {
          const updatedCollectionsIds = Array.from(
            new Set([...(b.collections_ids ?? []), collectionId])
          )
          return this.bookService!.updateBook({
            id: b.id as ID,
            data: {
              collections_ids: updatedCollectionsIds as ID[]
            }
          })
        })
      ])

      return {
        ok: true,
        message: 'Colección actualizada correctamente.'
      }
    }, 'Error adding books to collection')
  }
}
