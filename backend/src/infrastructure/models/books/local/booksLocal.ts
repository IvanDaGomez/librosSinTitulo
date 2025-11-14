import fs from 'node:fs/promises'
import { changeToArray } from '@/utils/changeToArray.js'
import { calculateMatchScore } from '@/utils/calculateMatchScore.js'
import * as tf from '@tensorflow/tfjs'
import { getBookKeyInfo } from './getBookKeyInfo.js'
import { getTrends } from '@/utils/getTrends.js'
import { randomIntArrayInRange } from './randomIntArrayRange.js'
import { createBook, createBookToReview } from '@/domain/mappers/createBook.js'
import { ID, ISOString } from '@/shared/types'
import { AuthToken } from '@/domain/entities/authToken.js'
import { CollectionType } from '@/domain/entities/collection.js'
import { BookToReviewType, BookType } from '@/domain/entities/book.js'
import path from 'node:path'
import { __dirname } from '@/utils/config'
import { filterBooksByFilters } from '@/infrastructure/models/books/local/filterBooksByFilters'
import { BookInterface } from '@/domain/interfaces/book.js'
import {
  StatusResponse,
  StatusResponseType
} from '@/domain/valueObjects/statusResponse.js'
import { UserType } from '@/domain/entities/user.js'
import { User } from 'mercadopago'
import { UserInterface } from '@/domain/interfaces/user.js'

const bookPath = path.join(__dirname, 'data', 'books.json')
const booksBackStagePath = path.join(__dirname, 'data', 'booksBackStage.json')
class BooksModel implements BookInterface {
  private usersModel: UserInterface
  constructor (UsersModel: UserInterface) {
    this.usersModel = UsersModel
    // Constructor vacío o inicialización si es necesario
  }

  async getAllBooks (): Promise<BookType[]> {
    const data = await fs.readFile(bookPath, 'utf-8')
    const books: BookType[] = JSON.parse(data)
    if (!books) {
      throw new Error('No hay libros disponibles')
    }
    return books.map(book => createBook(book, true)) as BookType[]
  }

  async getBookById (id: ID): Promise<BookType> {
    const books = await this.getAllBooks()
    const book = books.find(book => book.id === id)
    if (!book) {
      throw new Error('Libro no encontrado')
    }

    return createBook(book, true)
  }

  async getBooksByQuery (
    query: string,
    l: number,
    books: BookType[] = []
  ): Promise<Partial<BookType>[]> {
    if (books.length === 0) {
      books = await this.getAllBooks()
    }

    const queryWords = changeToArray(query)
    if (query === 'Nuevo') {
      return books
        .filter(book => book.availability === 'Disponible')
        .sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        })
        .slice(0, l)
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
      .filter(item => item.availability === 'Disponible')
      .slice(0, l)
    const bookToReturn: Partial<BookType>[] = filterdBooks.map(item =>
      createBook(item as BookType, true)
    )
    // Filtramos por disponibilidad y limitamos la cantidad de resultados
    return bookToReturn
  }

  async getBooksByQueryWithFilters (
    query: string,
    filters: Partial<Record<keyof BookType, any>>,
    limit: number
  ): Promise<Partial<BookType>[]> {
    let books = await this.getAllBooks() // Fetch all books (local data)
    if (Object.keys(filters).length === 0) return []

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
    const resultBooks: Partial<BookType>[] = await this.getBooksByQuery(
      query,
      limit,
      books
    )

    const bookToReturn = resultBooks.filter(
      book => book.availability === 'Disponible'
    )

    return bookToReturn
  }

  async createBook (data: BookType): Promise<BookType> {
    const books = await this.getAllBooks()
    const bookToAdd = createBook(data, true)
    books.push(bookToAdd)
    await fs.writeFile(bookPath, JSON.stringify(books, null, 2))
    return bookToAdd
  }

  async updateBook (id: ID, data: Partial<BookType>): Promise<BookType> {
    const books = await this.getAllBooks()

    const bookIndex = books.findIndex(book => book.id === id)
    if (bookIndex === -1) {
      throw new Error('Libro no encontrado')
    }
    data.updated_at = new Date().toISOString() as ISOString

    // Actualiza los datos del usuario
    Object.assign(books[bookIndex], data)

    // Hacer el path hacia aqui
    // change writeFile to writeFileSync, which makes it synchronous
    await fs.writeFile(bookPath, JSON.stringify(books, null, 2))

    return createBook(books[bookIndex], true)
  }

  async deleteBook (id: ID): Promise<StatusResponseType> {
    const books = await this.getAllBooks()
    const bookIndex = books.findIndex(book => book.id === id)
    if (bookIndex === -1) {
      throw new Error('Libro no encontrado')
    }
    books.splice(bookIndex, 1)
    await fs.writeFile(bookPath, JSON.stringify(books, null, 2))
    return StatusResponse.success('Book deleted successfully') // Mensaje de éxito
  }

  async getAllReviewBooks (): Promise<BookToReviewType[]> {
    const data = await fs.readFile(booksBackStagePath, 'utf-8')
    const books = JSON.parse(data) as BookToReviewType[]
    return books
  }

  async createReviewBook (
    data: Partial<BookToReviewType>
  ): Promise<BookToReviewType> {
    const books = await this.getAllReviewBooks()
    const bookToAdd = createBookToReview(data)
    books.push(bookToAdd)
    await fs.writeFile(booksBackStagePath, JSON.stringify(books, null, 2))
    return createBookToReview(bookToAdd)
  }

  async deleteReviewBook (id: ID): Promise<StatusResponseType> {
    const books = await this.getAllReviewBooks()
    const bookIndex = books.findIndex(book => book.id === id)

    if (bookIndex === -1) {
      throw new Error('Libro no encontrado')
    }

    books.splice(bookIndex, 1)
    await fs.writeFile(booksBackStagePath, JSON.stringify(books, null, 2))
    return StatusResponse.success('Book deleted successfully') // Mensaje de éxito
  }

  async updateReviewBook (
    id: ID,
    data: Partial<BookToReviewType>
  ): Promise<BookToReviewType> {
    const book = await this.getBookById(id)

    const reviewBooks = await this.getAllReviewBooks()
    const bookToAdd = createBookToReview(book)
    // Actualiza los datos del usuario
    Object.assign(book, data)
    reviewBooks.push(bookToAdd)

    await fs.writeFile(booksBackStagePath, JSON.stringify(reviewBooks, null, 2))

    return createBookToReview(book)
  }

  async forYouPage (
    userKeyInfo: AuthToken | undefined,
    sampleSize: number = 100
  ): Promise<Partial<BookType>[]> {
    const books = await this.getAllBooks()
    const randomIndexes: number[] = randomIntArrayInRange(
      0,
      books.length,
      sampleSize
    ) // [ 34, 14, 27, 17, 30, 27, 20, 26, 21, 14 ]
    const selectedBooks = randomIndexes
      .map(index => books[index])
      .filter(
        element =>
          element !== undefined && element.availability === 'Disponible'
      )
    // Las querywords sería palabras que el usuario tiene en base a sus gustos
    const trends = await getTrends()

    let historial: string[] = []
    let preferences: string[] = []
    let likes: ID[] = []
    if (userKeyInfo?.id) {
      const user = await this.usersModel.getUserById(userKeyInfo.id)
      preferences = Object.keys(user?.preferences || {})
      historial = Object.keys(user?.search_history || {})
      likes = user.favorites ?? []
      // Si el usuario tiene libros favoritos, entonces los agrego a las querywords
      if (likes.length > 0) {
        const booksFavorites = await this.getBooksByIdList(likes, 10)
        preferences = [
          ...preferences,
          ...booksFavorites.map(book => book.title ?? '')
        ]
      }
    }
    const queryWords = [...preferences, ...historial, ...trends]
    // Calculate the distances in these selected items
    const booksWithScores = selectedBooks
      .map(book => {
        let score = calculateMatchScore(book, queryWords, 'query') // Query se usa para considerar si la palabra es muy pequeña, por lo que aquí solo agregaré una palabra de más de 4 letras para asegurar la tolerancia
        const threshold = 0 // Revisar si es necesario
        const bookKeyInfo = getBookKeyInfo(book)
        if (score >= queryWords.length * threshold) {
          // Priorizar las preferencias del usuario
          if (preferences.some(preference => bookKeyInfo.includes(preference)))
            score += 10
          return { book, score }
        } else return null
      })
      .filter(item => item !== null)

    booksWithScores.sort((a, b) => b.score - a.score)
    // Suffle the array to get a random order
    const shuffledBooks = booksWithScores.sort(() => Math.random() - 0.5)
    return shuffledBooks
      .slice(0, sampleSize)
      .map(item => createBook(item.book, false))
  }

  async getFavoritesByUser (favorites: ID[]): Promise<Partial<BookType>[]> {
    const books = await this.getAllBooks()

    const elements = books.filter(book => favorites.includes(book.id))
    return elements
  }

  async getBooksByIdList (list: ID[], l: number): Promise<Partial<BookType>[]> {
    const books = await this.getAllBooks()
    const filteredBooks = books
      .filter(book => {
        return list.includes(book.id)
      })
      .slice(0, l)

    if (!filteredBooks || filteredBooks.length === 0) {
      throw new Error('No hay libros disponibles')
    }

    return filteredBooks.map(book => createBook(book, false))
  }

  async predictInfo (
    file: Express.Multer.File
  ): Promise<{ title: string; author: string }> {
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
  }
  async getBooksByCollection (collection: CollectionType): Promise<BookType[]> {
    // Esta función devuelve todos los libros de una colección específica
    try {
      // Obtener todos los libros
      const books: BookType[] = await this.getAllBooks()

      // Filtrar los libros que pertenecen a la colección
      const colecciones = books.filter(book =>
        collection.book_ids.includes(book.id)
      )

      if (colecciones.length === 0) {
        throw new Error('No se encontraron libros en esta colección')
      }
      return colecciones
    } catch (error) {
      console.error('Error en getBooksByCollection:', error)
      throw new Error('No se pudieron obtener los libros de la colección')
    }
  }

  async getBooksByUserId (userId: ID): Promise<BookType[]> {
    const books = await this.getAllBooks()
    const filteredBooks = books.filter(book => book.seller_id === userId)
    return filteredBooks
  }
}

export { BooksModel }
