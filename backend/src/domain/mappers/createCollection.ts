import { CollectionType } from '@/domain/entities/collection'
import { ISOString } from '@/shared/types'

const collectionObject = (data: Partial<CollectionType>): CollectionType => {
  return {
    id: data.id ?? crypto.randomUUID(),
    photo: data.photo ?? '',
    book_ids: data.book_ids ?? [],
    name: data.name ?? '',
    description: data.description || '',
    followers: data.followers || [],
    user_id: data.user_id ?? crypto.randomUUID(),
    saga: data.saga || false,
    created_at: data.created_at || (new Date().toISOString() as ISOString)
  }
}

export { collectionObject }
