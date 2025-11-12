import { BookType } from '@/domain/entities/book'

// Overload signatures
function bookObject(
  data: BookType | Partial<BookType>,
  fullInfo: true
): BookType
function bookObject(
  data: BookType | Partial<BookType>,
  fullInfo: false
): Partial<BookType>

// Implementation
function bookObject (
  data: BookType | Partial<BookType>,
  fullInfo = true
): BookType | Partial<BookType> {
  if (fullInfo) {
    return {
      title: data.title ?? '',
      author: data.author ?? '',
      price: data.price ?? 0,
      offer: data.offer ?? null,
      isbn: data.isbn ?? '',
      images: data.images ?? [],
      keywords: data.keywords ?? [],
      id: data.id ?? crypto.randomUUID(),
      description: data.description ?? '',
      status: data.status ?? 'Nuevo',
      genre: data.genre ?? '',
      format: data.format ?? '',
      seller: data.seller ?? '',
      seller_id: data.seller_id ?? '',
      edition: data.edition ?? '',
      language: data.language ?? '',
      location: data.location ?? {
        city: '',
        department: '',
        country: ''
      },
      cover: data.cover ?? '',
      age: data.age ?? '',
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
      availability: data.availability ?? 'Disponible',
      messages: data.messages ?? [],
      collections_ids: data.collections_ids ?? []
    } as BookType
  }
  return {
    title: data.title ?? '',
    author: data.author ?? '',
    price: data.price ?? 0,
    offer: data.offer ?? null,
    isbn: data.isbn ?? '',
    keywords: data.keywords ?? [],
    images: data.images ?? [],
    id: data.id ?? '',
    seller_id: data.seller_id ?? '',
    seller: data.seller ?? '',
    status: data.status ?? 'Nuevo sellado',
    genre: data.genre ?? '',
    availability: data.availability ?? 'Disponible',
    collections_ids: data.collections_ids ?? [],
    created_at: data.created_at ?? new Date().toISOString()
  } as Partial<BookType>
}

export { bookObject }
