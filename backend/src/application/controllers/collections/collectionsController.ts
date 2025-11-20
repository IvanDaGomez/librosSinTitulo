// import { crearCollage } from '../../utils/createCollage.js'
import { validateCollection, validatePartialCollection } from '@/utils/validate'
import { replaceDashesWithSpaces } from '@/utils/parseSpaces'

import express from 'express'
import { ID, ImageType, ISOString } from '@/shared/types'
import { CollectionType } from '@/domain/entities/collection'
import { BookType } from '@/domain/entities/book'
import BookCategories from '@/domain/valueObjects/bookCategories'
import { AuthToken } from '@/domain/entities/authToken'
import { CollectionInterface } from '@/domain/interfaces/collection'
import { BookInterface } from '@/domain/interfaces/book'
import { BookService } from '@/application/services/books/bookService'
import { CollectionService } from '@/application/services/collections/collectionService'
import { ApiResponse } from '@/domain/valueObjects/apiResponse'
class CollectionsController {
  collectionService: CollectionInterface
  bookService: BookInterface
  constructor ({
    CollectionsModel,
    BooksModel
  }: {
    CollectionsModel: CollectionInterface
    BooksModel: BookInterface
  }) {
    this.collectionService = new CollectionService(CollectionsModel)
    this.bookService = new BookService(BooksModel)
  }

  getAllCollections = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const collections = await this.collectionService.getAllCollections()
      res.json(ApiResponse.success(collections))
    } catch (err) {
      next(err)
    }
  }

  getCollectionById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const collectionId = req.params.collection_id as ID
      const collection = await this.collectionService.getCollectionById(
        collectionId
      )
      res.json(ApiResponse.success(collection))
    } catch (err) {
      next(err)
    }
  }

  getCollectionsByUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.user_id as ID

      const collections = await this.collectionService.getCollectionsByUser(
        userId
      )

      res.json(ApiResponse.success(collections))
    } catch (err) {
      next(err)
    }
  }

  getBooksByCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const collectionId = req.params.collection_id as ID | undefined
      if (!collectionId) {
        return res
          .status(400)
          .json(ApiResponse.error('No se proporcionó el collectionId', 400))
      }
      const collection = await this.collectionService.getCollectionById(
        collectionId
      )
      const books = await this.bookService.getBooksByIdList(
        collection.books_ids,
        24
      )

      res.json(ApiResponse.success(books))
    } catch (err) {
      next(err)
    }
  }

  createCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const rawData = req.body as
        | Partial<CollectionType>
        | { saga: string }
        | undefined
      if (!rawData) {
        return res
          .status(400)
          .json(ApiResponse.error('No se proporcionó la colección', 400))
      }
      const data = rawData as Partial<CollectionType>
      if (req.file) data.photo = `${req.file.filename}` as ImageType
      if (rawData.saga) data.saga = rawData.saga === 'true'
      // Validación
      const validated = validateCollection(data)
      if (!validated.success) {
        return res
          .status(400)
          .json(ApiResponse.error(String(validated.error), 400))
      }

      // Crear la colección en la base de datos
      const collection = await this.collectionService.createCollection(data)
      // Si todo es exitoso, devolver el colección creado
      res.json(ApiResponse.success(collection))
    } catch (err) {
      next(err)
    }
  }

  deleteCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const collectionId = req.params.collection_id as ID

      const result = await this.collectionService.deleteCollection(collectionId)

      res.json(ApiResponse.success(result))
    } catch (err) {
      next(err)
    }
  }

  updateCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const collectionId = req.params.collection_id as ID | undefined
      const data = req.body as Partial<CollectionType> | undefined
      if (!collectionId || !data) {
        return res
          .status(400)
          .json(ApiResponse.error('Faltan algunos campos', 400))
      }
      const valid = validatePartialCollection(data)

      if (!valid) {
        return res.status(404).json(ApiResponse.error('No válido', 404))
      }
      const updated = await this.collectionService.updateCollection(
        collectionId,
        data
      )

      res.json(ApiResponse.success(updated))
    } catch (err) {
      next(err)
    }
  }

  addBookToCollection = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { booksIds, collectionId } = req.query as {
        booksIds: string | undefined // expecting a string of comma-separated IDs
        collectionId: ID | undefined
      }

      // Validate inputs
      if (!booksIds || !collectionId) {
        return res
          .status(400)
          .json(
            ApiResponse.error('Faltan parámetros: booksIds o collectionId', 400)
          )
      }
      // Convert booksIds to an array of IDs
      const booksList = booksIds.split(',').map(id => id.trim()) as ID[]

      // Fetch books and the collection
      let books = await this.bookService.getBooksByIdList(booksList, 24)
      const collection = await this.collectionService.getCollectionById(
        collectionId
      )

      // Filter books to ensure they're not already in the collection
      books = books.filter(
        b =>
          !b.collections_ids?.includes(collectionId) &&
          !collection.books_ids?.includes(b.id as ID)
      )

      // Ensure unique collections in the collection and book
      const newCollectionList = [
        ...new Set([...collection.books_ids, ...books.map(b => b.id)])
      ]

      // Update collection and books
      await Promise.all([
        this.collectionService.updateCollection(collectionId, {
          books_ids: newCollectionList as ID[]
        }),
        ...books.map(b => {
          b.collections_ids = Array.from(
            new Set([...(b.collections_ids ?? []), collectionId])
          )
          console.log('b.collections_ids', b.collections_ids)
          this.bookService.updateBook(b.id as ID, {
            collections_ids: b.collections_ids as ID[]
          })
        })
      ])
      // Send response
      res.json(
        ApiResponse.success({ message: 'Colección actualizada correctamente.' })
      )
    } catch (err) {
      next(err)
    }
  }

  getCollectionByQuery = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      let { q, l } = req.query as {
        q: string | undefined
        l: string | undefined
      }
      q = replaceDashesWithSpaces(q)
      const lParsed = parseInt(l ?? '24', 10) // Default to 24 if l is not a valid number
      if (!q) {
        return res
          .status(400)
          .json({ error: 'El parámetro de consulta "q" es requerido' })
      }

      const collections = await this.collectionService.getCollectionByQuery(
        q,
        lParsed
      ) // Asegurarse de implementar este método en BooksModel

      res.json(ApiResponse.success(collections))
    } catch (err) {
      next(err)
    }
  }

  getCollectionsByQueryWithFilters = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    // Destructure query parameters
    try {
      let data = req.query as {
        q: string | undefined
        l: string | undefined
        genre: BookCategories['genres'][number] | undefined
        location:
          | {
              country: string | undefined
              city: string | undefined
              department: string | undefined
            }
          | undefined
        country: string | undefined
        city: string | undefined
        department: string | undefined
        age: BookCategories['ages'][number] | undefined
        cover: BookCategories['covers'][number] | undefined
        created_at: ISOString | undefined
        language: BookCategories['languages'][number] | undefined
        status: BookCategories['states'][number] | undefined
      }
      // Apply the filter transformation (change hyphens to spaces)
      Object.keys(data).forEach(key => {
        if (data[key as keyof typeof data]) {
          ;(data as any)[key] = replaceDashesWithSpaces((data as any)[key])
        }
      })
      // Validate required query parameter "q"
      if (!data.q) {
        return res
          .status(400)
          .json(
            ApiResponse.error('El parámetro de consulta "q" es requerido', 400)
          )
      }

      // Set default pagination limit if not provided
      const lParsed = parseInt(data.l ?? '', 10) ?? 24 // Default to 24 if l is not a valid number

      // Prepare filter object for query
      const filterObj: Partial<BookType> = {
        genre: data.genre,
        ...(data.location ?? {
          country: '',
          city: '',
          department: ''
        }),
        age: data.age ?? '',
        cover: data.cover ?? '',
        created_at: data.created_at,
        language: data.language
      }

      // Initialize the query object to search for books (adjust according to your database/model)

      // Build the query dynamically based on provided filters
      const query = {
        query: data.q,
        where: {} as Record<string, unknown>,
        l: lParsed
      }

      // Add filters to the query where clause dynamically
      Object.keys(filterObj).forEach(filterKey => {
        const value = filterObj[filterKey as keyof BookType]
        if (value) {
          // Only add filters with a truthy value
          query.where[filterKey] = value
        }
      })

      const collections =
        await this.collectionService.getCollectionsByQueryWithFilters(query)

      // If no collections found
      if (collections.length === 0) {
        return res
          .status(404)
          .json(
            ApiResponse.error(
              'No collections found matching your filters.',
              404
            )
          )
      }
      return res.json(ApiResponse.success(collections))
    } catch (err) {
      next(err)
    }
  }

  getCollectionSaga = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const { book_id, user_id } = req.body as {
        book_id: ID | undefined
        user_id: ID | undefined
      }
      if (!book_id || !user_id) {
        return res
          .status(401)
          .json(ApiResponse.error('No se proporcionaron todos los datos', 401))
      }
      const collection = await this.collectionService.getCollectionSaga(
        book_id,
        user_id
      )
      res.json(ApiResponse.success(collection))
    } catch (err) {
      next(err)
    }
  }
  forYouPageCollections = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    /*
      Aquí se obtiene libros específicos por su query y se envía como respuesta.
      Las consultas actualizan las estadísticas de los libros y los usuarios.
    */
    try {
      const l = req.query.l as string
      const lParsed = parseInt(l, 10) || 24
      const user = req.session.user as AuthToken | undefined
      const results = await this.collectionService.forYouPageCollections(
        user,
        lParsed
      )

      return res.json(ApiResponse.success(results))
    } catch (err) {
      next(err)
    }
  }
}

export { CollectionsController }
