import { CollectionType } from '@/domain/entities/collection'
import { ISOString } from '@/shared/types'
import { parseValue } from '@/utils/parseValue'

const createCollection = (data: Partial<CollectionType>): CollectionType => {
  return {
    id: parseValue(data.id, crypto.randomUUID()),
    photo: parseValue(data.photo, ''),
    books_ids: parseValue(data.books_ids, []),
    name: parseValue(data.name, ''),
    description: parseValue(data.description, ''),
    followers: parseValue(data.followers, []),
    user_id: parseValue(data.user_id, crypto.randomUUID()),
    saga: parseValue(data.saga, false),
    created_at: parseValue(
      data.created_at,
      new Date().toISOString() as ISOString
    )
  }
}

export { createCollection }
