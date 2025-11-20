import { BookToReviewType, BookType } from '@/domain/entities/book'
import { ISOString } from '@/shared/types'
import { parseValue } from '@/utils/parseValue'

// Overload signatures
function createBook(data: Partial<BookType>, fullInfo: true): BookType
function createBook(data: Partial<BookType>, fullInfo: false): Partial<BookType>

// Implementation
function createBook (
  data: Partial<BookType>,
  fullInfo = true
): BookType | Partial<BookType> {
  if (fullInfo) {
    return {
      title: parseValue<string>(data.title, ''),
      author: parseValue<string>(data.author, ''),
      price: parseValue<number>(data.price, 0),
      offer: parseValue<number | null>(data.offer ?? null, null),
      isbn: parseValue<string>(data.isbn, ''),
      keywords: parseValue<string[]>(data.keywords, []),
      images: parseValue<string[]>(data.images, []),
      id: parseValue<string>(
        data.id ?? crypto.randomUUID(),
        crypto.randomUUID()
      ),
      description: parseValue<string>(data.description, ''),
      status: parseValue<string>(data.status ?? 'Nuevo', 'Nuevo'),
      genre: parseValue<string>(data.genre, ''),
      format: parseValue<string>(data.format, ''),
      seller: parseValue<string>(data.seller, ''),
      seller_id: parseValue<string>(data.seller_id, ''),
      edition: parseValue<string | undefined>(data.edition, undefined),
      language: parseValue<string | undefined>(data.language, undefined),
      location: parseValue<{
        city: string
        department: string
        country: string
      }>(data.location, { city: '', department: '', country: '' }),
      cover: parseValue<string>(data.cover, ''),
      age: parseValue<string>(data.age, ''),
      created_at: parseValue<ISOString>(
        data.created_at ?? new Date().toISOString(),
        new Date().toISOString()
      ),
      updated_at: parseValue<ISOString>(
        data.updated_at ?? new Date().toISOString(),
        new Date().toISOString()
      ),
      availability: parseValue<string>(
        data.availability ?? 'Disponible',
        'Disponible'
      ),
      messages: parseValue<any[]>(data.messages, []),
      collections_ids: parseValue<string[]>(data.collections_ids, [])
    } as BookType
  }

  return {
    title: parseValue<string>(data.title, ''),
    author: parseValue<string>(data.author, ''),
    price: parseValue<number>(data.price, 0),
    offer: parseValue<number | null>(data.offer ?? null, null),
    isbn: parseValue<string>(data.isbn, ''),
    keywords: parseValue<string[]>(data.keywords, []),
    images: parseValue<string[]>(data.images, []),
    id: parseValue<string>(data.id ?? '', ''),
    seller_id: parseValue<string>(data.seller_id, ''),
    seller: parseValue<string>(data.seller, ''),
    status: parseValue<string>(data.status ?? 'Nuevo sellado', 'Nuevo sellado'),
    genre: parseValue<string>(data.genre, ''),
    availability: parseValue<string>(
      data.availability ?? 'Disponible',
      'Disponible'
    ),
    collections_ids: parseValue<string[]>(data.collections_ids, []),
    created_at: parseValue<ISOString>(
      data.created_at ?? new Date().toISOString(),
      new Date().toISOString()
    )
  } as Partial<BookType>
}

function createBookToReview (
  data: Partial<BookToReviewType> | Partial<BookType> = {}
): BookToReviewType {
  return {
    title: parseValue<string>(data.title, ''),
    author: parseValue<string>(data.author, ''),
    price: parseValue<number>(data.price, 0),
    offer: parseValue<number | null>(data.offer ?? null, null),
    isbn: parseValue<string>(data.isbn, ''),
    images: parseValue<string[]>(data.images, []),
    keywords: parseValue<string[]>(data.keywords, []),
    id: parseValue<string>(
      data.id ?? crypto.randomUUID(),
      crypto.randomUUID()
    ) as any,
    description: parseValue<string>(data.description, ''),
    status: parseValue<string>(data.status ?? 'Nuevo', 'Nuevo') as any,
    genre: parseValue<string>(data.genre ?? '', '') as any,
    format: parseValue<string>(data.format ?? '', '') as any,
    seller: parseValue<string>(data.seller, ''),
    seller_id: parseValue<string>(data.seller_id ?? '', '') as any,
    edition: parseValue<string | undefined>(data.edition, undefined),
    language: parseValue<string | undefined>(data.language, undefined),
    location: parseValue<{ city: string; department: string; country: string }>(
      data.location,
      { city: '', department: '', country: '' }
    ),
    cover: parseValue<string>(data.cover, ''),
    age: parseValue<string>(data.age, ''),
    created_at: parseValue<ISOString>(
      data.created_at ?? new Date().toISOString(),
      new Date().toISOString()
    ),
    updated_at: parseValue<ISOString>(
      data.updated_at ?? new Date().toISOString(),
      new Date().toISOString()
    ),
    availability: 'En revisión'
  }
}

export { createBook, createBookToReview }
