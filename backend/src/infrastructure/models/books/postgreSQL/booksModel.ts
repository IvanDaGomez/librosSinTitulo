import fs from 'node:fs/promises'
import { changeToArray } from '@/utils/changeToArray'
import { calculateMatchScore } from '@/utils/calculateMatchScore'
import * as tf from '@tensorflow/tfjs'
import { getBookKeyInfo } from '../local/getBookKeyInfo.js'
import { getTrends } from '@/utils/getTrends'
import { createBook } from '@/domain/mappers/createBook'
import { ID, ISOString } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken'
import { CollectionType } from '@/domain/entities/collection'
import { Book, BookToReviewType, BookType } from '@/domain/entities/book'
import {
  executeQuery,
  executeSingleResultQuery,
  DatabaseError
} from '@/utils/dbUtils'
import { filterBooksByFilters } from '../local/filterBooksByFilters.js'
import { pool } from '@/utils/config'
import { BookInterface } from '@/domain/interfaces/book.js'
import { ModelError } from '@/domain/exceptions/modelError.js'
import { UserInterface } from '@/domain/interfaces/user.js'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse.js'
import { UserType } from '@/domain/entities/user.js'
class BooksModel implements BookInterface {
  private getEssencialFields (): string[] {
    return Object.keys(createBook({}, false))
  }

  private async handle<T> (fn: () => Promise<T>, message: string): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      throw new ModelError(
        message,
        error instanceof Error ? error.stack : undefined
      )
    }
  }
  async getAllBooks (): Promise<BookType[]> {
    return this.handle(async () => {
      const books = await executeQuery<BookType>(
        pool,
        () => pool.query('SELECT * FROM books;'),
        'Failed to fetch books from database'
      )

      return books
    }, 'Error retrieving all books')
  }

  async getBookById (id: ID): Promise<BookType> {
    return this.handle(async () => {
      const data = await executeSingleResultQuery<BookType>(
        pool,
        () => pool.query('SELECT * FROM books WHERE id = $1;', [id]),
        `Failed to fetch book with ID ${id}`
      )
      if (!data) {
        throw new ModelError('Book not found')
      }
      return data
    }, `Error retrieving book with ID ${id}`)
  }

  async getBooksByQuery (
    query: string,
    l: number = 24,
    books: BookType[] = []
  ): Promise<Partial<BookType>[]> {
    return this.handle(async () => {
      if (books.length === 0) {
        books = await executeQuery(
          pool,
          () =>
            pool.query(
              `SELECT ${this.getEssencialFields().join(', ')} 
              FROM books WHERE disponibilidad = 'Disponible' ORDER BY RANDOM() LIMIT $1;`,
              [l]
            ),
          'Failed to fetch books from database'
        )
      }
      const queryWords = changeToArray(query)
      if (query === 'Nuevo') {
        return books
          .filter(book => book.availability === 'Disponible')
          .sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            )
          })
      }
      // Calculamos los scores y filtramos directamente los que no cumplen el umbral
      const booksWithScores = books
        .map(book => ({
          book,
          score: calculateMatchScore(book, queryWords, query)
        }))
        .filter(({ score }) => score >= queryWords.length * 0.7)

      // Ordenamos antes de filtrar por cantidad
      const filterdBooks: Partial<BookType>[] = booksWithScores
        .sort((a, b) => b.score - a.score)
        .map(item => item.book)

      return filterdBooks
    }, `Error getting books by query: ${query}`)
  }

  async getBooksByQueryWithFilters (
    query: string,
    filters: Partial<Record<keyof BookType, any>>,
    limit: number
  ): Promise<Partial<BookType>[]> {
    // TODO: Implementar la función en la base de datos como tal
    return this.handle(async () => {
      let books = await executeQuery(
        pool,
        () =>
          pool.query(
            `SELECT * FROM books WHERE disponibilidad = 'Disponible' ORDER BY RANDOM() LIMIT 1000;`
          ),
        'Failed to fetch books from database'
      )

      type PreparedFiltersType = Partial<
        {
          [key in keyof BookType[]]?: any[] | number
        } & {
          min_precio?: number
          max_precio?: number
          ciudad?: string[]
          departamento?: string[]
        }
      >
      const preparedFilters: PreparedFiltersType = {}
      Object.keys(filters).forEach(filter => {
        const filterValue = filters[filter as keyof BookType]
        if (typeof filterValue === 'string') {
          preparedFilters[filter as any] = filterValue.split(',')
        }
        if (
          filter === 'precio' &&
          Array.isArray(preparedFilters[filter as keyof PreparedFiltersType])
        ) {
          const prices = preparedFilters[
            filter as keyof PreparedFiltersType
          ] as number[]
          preparedFilters['min_precio'] = Math.min(...prices)
          preparedFilters['max_precio'] = Math.max(...prices)
          delete preparedFilters[filter as keyof PreparedFiltersType]
        }
      })
      books = filterBooksByFilters(books, preparedFilters)
      // Perform search based on the query
      const resultBooks = await this.getBooksByQuery(query, limit, books)

      return resultBooks
    }, `Error getting books by query with filters: ${query}`)
  }

  async createBook (data: BookType): Promise<BookType> {
    return this.handle(async () => {
      const book = createBook(data, true)
      await executeQuery(
        pool,
        () =>
          pool.query(
            `INSERT INTO books (id, title, author, price, offer, isbn, images, keywords, 
          description, status, genre, format, seller, seller_id, edition, language, 
          location, cover, age, created_at, updated_at, availability,
          messages, collections_ids)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20,$21,$22, $23, $24);`,
            [
              book.id,
              book.title,
              book.author,
              book.price,
              book.offer,
              book.isbn,
              book.images,
              book.keywords,
              book.description,
              book.status,
              book.genre,
              book.format,
              book.seller,
              book.seller_id,
              book.edition,
              book.language,
              book.location,
              book.cover,
              book.age,
              book.created_at,
              book.updated_at,
              book.availability,
              book.messages,
              book.collections_ids
            ]
          ),
        'Failed to create new book'
      )
      return book
    }, 'Error creating new book')
  }

  async updateBook (id: ID, data: Partial<BookType>): Promise<BookType> {
    return this.handle(async () => {
      data.updated_at = new Date().toISOString() as ISOString
      const keys = Object.keys(data)
      const values = Object.values(data)
      let updateString = ''
      for (const i of keys) {
        updateString += `${i} = $${keys.indexOf(i) + 1}, `
      }
      updateString = updateString.slice(0, -2) // Remove last comma and space

      const result = await executeSingleResultQuery<BookType>(
        pool,
        () =>
          pool.query(
            `UPDATE books SET ${updateString} WHERE ID = $${
              keys.length + 1
            } RETURNING *;`,
            [...values, id]
          ),
        `Failed to update book with ID ${id}`
      )

      if (!result) {
        throw new ModelError('Book not found')
      }
      return result
    }, `Error updating book with ID ${id}`)
  }

  async deleteBook (id: ID): Promise<StatusResponseType> {
    return this.handle(async () => {
      // Check if the book exists
      const result = await executeSingleResultQuery(
        pool,
        () => pool.query('SELECT * FROM books WHERE id = $1;', [id]),
        'Failed to find book to delete'
      )
      if (!result) throw new Error('Book not found')
      await executeQuery(
        pool,
        () => pool.query('DELETE FROM books WHERE id = $1;', [id]),
        `Failed to delete book with ID ${id}`
      )
      return StatusResponse.success('Book deleted successfully')
    }, `Error deleting book with ID ${id}`)
  }

  async getAllReviewBooks (): Promise<BookType[]> {
    return this.handle(async () => {
      return await executeQuery(
        pool,
        () => pool.query('SELECT * FROM books_backstage;'),
        'Failed to fetch review books from database'
      )
    }, 'Error retrieving all review books')
  }

  async createReviewBook (data: Partial<BookType>): Promise<BookType> {
    return this.handle(async () => {
      let book = createBook(data, true)
      const response = await executeSingleResultQuery<BookType>(
        pool,
        () =>
          pool.query(
            `INSERT INTO books_backstage (id, title, author, price, offer, isbn, images, keywords, 
          description, status, genre, format, seller, seller_id, edition, language, 
          location, cover, age, created_at, updated_at, availability,
          messages, collections_ids)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
          RETURNING *
          ;`,
            [
              book.id,
              book.title,
              book.author,
              book.price,
              book.offer,
              book.isbn,
              book.images,
              book.keywords,
              book.description,
              book.status,
              book.genre,
              book.format,
              book.seller,
              book.seller_id,
              book.edition,
              book.language,
              book.location,
              book.cover,
              book.age,
              book.created_at,
              book.updated_at,
              book.availability,
              book.messages,
              book.collections_ids
            ]
          ),
        'Failed to create review book'
      )
      return book
    }, 'Error creating review book')
  }

  async deleteReviewBook (id: ID): Promise<StatusResponseType> {
    return this.handle(async () => {
      await executeQuery(
        pool,
        () => pool.query('DELETE FROM books_backstage WHERE id = $1;', [id]),
        `Failed to delete review book with ID ${id}`
      )
      return StatusResponse.success('Review book deleted successfully')
    }, `Error deleting review book with ID ${id}`)
  }

  async updateReviewBook (
    id: ID,
    data: Partial<BookToReviewType>
  ): Promise<BookToReviewType> {
    return this.handle(async () => {
      const [keys, values] = Object.entries(data)
      const updateString = keys.reduce((last, key, index) => {
        const prefix = index === 0 ? '' : ', '
        return `${last}${prefix}${key} = $${index + 1}`
      })
      const result = await executeSingleResultQuery<BookToReviewType>(
        pool,
        () =>
          pool.query(
            `UPDATE books_backstage SET ${updateString} WHERE ID = $${
              keys.length + 1
            } RETURNING *;`,
            [...values, id]
          ),
        `Failed to update review book with ID ${id}`
      )

      if (!result) {
        throw new DatabaseError('Review book not found')
      }

      return result
    }, `Error updating review book with ID ${id}`)
  }

  async forYouPage (
    userKeyInfo: AuthToken | undefined,
    sampleSize: number = 1000,
    userService: UserInterface
  ): Promise<Partial<BookType>[]> {
    return this.handle(async () => {
      const books = await executeQuery<Partial<BookType>>(
        pool,
        () =>
          pool.query(
            `SELECT ${this.getEssencialFields().join(
              ', '
            )} FROM books WHERE disponibilidad = 'Disponible' ORDER BY RANDOM() LIMIT $1;`,
            [sampleSize]
          ),
        'Failed to fetch random books for recommendations'
      )
      // console.log('Libros para recomendaciones', books)

      // Las querywords sería palabras que el usuario tiene en base a sus gustos
      const trends = await getTrends(20, 'postgres')

      let historial: string[] = []
      let preferences: string[] = []
      let likes: ID[] = []
      if (userKeyInfo?.id) {
        const user = await userService.getUserById(userKeyInfo.id)
        preferences = Object.keys(user?.preferences || {})
        historial = Object.keys(user?.search_history || {})
        likes = user.favorites ?? []

        // Si el usuario tiene libros favoritos, entonces los agrego a las querywords

        if (likes.length > 0) {
          const booksFavorites = await this.getBooksByIdList(likes)

          preferences = [
            ...preferences,
            ...booksFavorites
              .filter(b => b !== undefined)
              .map(book => book.title ?? '')
          ]
        }
      }
      const queryWords = [...preferences, ...historial, ...trends]

      // Calculate the distances in these selected items
      const booksWithScores = books
        .map(book => {
          let score = calculateMatchScore(book, queryWords, 'query') // Query se usa para considerar si la palabra es muy pequeña, por lo que aquí solo agregaré una palabra de más de 4 letras para asegurar la tolerancia
          const threshold = 0 // Revisar si es necesario
          const bookKeyInfo = getBookKeyInfo(book)

          if (score >= queryWords.length * threshold) {
            // Priorizar las preferencias del usuario
            if (
              preferences.some(preference => bookKeyInfo.includes(preference))
            ) {
              score += 10
            }
            return { book, score }
          } else return null
        })
        .filter(
          (item): item is { book: BookType; score: number } => item !== null
        )

      booksWithScores.sort((a, b) => b.score - a.score)

      return booksWithScores.map(item => createBook(item.book, false))
    }, 'Error generating For You page recommendations')
  }

  async getBooksByIdList (list: ID[]): Promise<BookType[]> {
    return this.handle(async () => {
      if (!list || list.length === 0) return []

      const books = await executeQuery<BookType>(
        pool,
        () =>
          pool.query(
            `SELECT * FROM books WHERE id = ANY($1) AND disponibilidad = 'Disponible';`,
            [list]
          ),
        'Failed to fetch favorite books by user'
      )

      // Preserve the order of the incoming favorites array
      const booksById = new Map(books.map(b => [b.id, b]))
      const ordered = list
        .map(id => booksById.get(id))
        .filter((b): b is BookType => !!b)

      return ordered
    }, 'Error fetching favorite books by user')
  }
  async getBooksByUserId (userId: ID): Promise<BookType[]> {
    return this.handle(async () => {
      const books = await executeQuery<BookType>(
        pool,
        () =>
          pool.query(
            'SELECT * FROM books WHERE seller_id = $1 ORDER BY created_at DESC;',
            [userId]
          ),
        `Failed to fetch books for user with ID ${userId}`
      )
      return books
    }, `Error getting books with userId:${userId}`)
  }
  async predictInfo (
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }> {
    return this.handle(async () => {
      // Read the file buffer
      const imageBuffer = await fs.readFile(file.path)
      const tensor = tf.tensor([0, 0, 0])
      // Convert buffer to Tensor
      // const tensor = decodeImage(imageBuffer)
      //   .resizeNearestNeighbor([224, 336]) // Resize for model input (adjust as needed)
      //   .expandDims() // Add batch dimension
      //   .toFloat()
      //   .div(255.0) // Normalize pixel values

      // Load the model (assuming it's a pre-trained model)
      const model = await tf.loadLayersModel('file://path_to_model/model.json')

      // Make prediction
      // eslint-disable-next-line no-unused-vars
      const prediction = model.predict(tensor)

      return {
        title: 'Hola',
        author: 'soy'
      }
    }, 'Error predicting book info from image')
  }
  async getBooksByCollection (collection: CollectionType): Promise<BookType[]> {
    return this.handle(async () => {
      const ids = collection.book_ids
      return this.getBooksByIdList(ids)
    }, `Error getting books for collection with ID ${collection.id}`)
  }
}

export { BooksModel }
