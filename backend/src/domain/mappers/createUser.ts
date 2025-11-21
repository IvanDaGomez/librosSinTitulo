import { ID, ImageType, ISOString } from '@/shared/types'
import {
  PartialUserType,
  UserType,
  LocationType,
  CollectionItem
} from '@/domain/entities/user.js'
import { parseValue } from '@/utils/parseValue.js'
import UserCategories from '../valueObjects/userCategories.js'

function createUser(data: Partial<UserType>, fullInfo: false): PartialUserType
function createUser(data: Partial<UserType>, fullInfo: true): UserType

function createUser (
  data: Partial<UserType>,
  fullInfo = false
): UserType | PartialUserType {
  if (fullInfo) {
    const fullAnswer: UserType = {
      id: parseValue<ID>(data.id, crypto.randomUUID()),
      name: parseValue<string>(data.name, ''),
      email: parseValue<string>(data.email, ''),
      password: parseValue<string>(data.password, ''),
      role: parseValue<UserCategories['roles'][number]>(data.role, 'user'),
      profile_picture: parseValue<ImageType>(data.profile_picture, ''),
      books_ids: parseValue<ID[]>(data.books_ids, []),
      account_status: parseValue<UserCategories['accountStatus'][number]>(
        data.account_status,
        'Activo'
      ),
      created_at: parseValue<ISOString>(
        data.created_at,
        new Date().toISOString() as ISOString
      ),
      updated_at: parseValue<ISOString>(
        data.updated_at,
        new Date().toISOString() as ISOString
      ),
      bio: parseValue<string>(data.bio, ''),
      favorites: parseValue<ID[]>(data.favorites, []),
      conversations_ids: parseValue<ID[]>(data.conversations_ids, []),
      notifications_ids: parseValue<ID[]>(data.notifications_ids, []),
      validated: parseValue<boolean>(data.validated, false),
      login: parseValue<UserCategories['loginMethods'][number]>(
        data.login,
        'Default'
      ),
      location: parseValue<LocationType>(data.location, {
        street: '',
        city: '',
        country: '',
        postal_code: ''
      }),
      followers: parseValue<ID[]>(data.followers, []),
      following: parseValue<ID[]>(data.following, []),
      collections_ids: parseValue<CollectionItem[]>(data.collections_ids, []),
      preferences: parseValue<{
        [key: string]: number
      }>(data.preferences, {}),
      search_history: parseValue<{
        [key: string]: number
      }>(data.search_history, {}),
      balance: {
        pending: parseValue<number>(data.balance?.pending, 0),
        available: parseValue<number>(data.balance?.available, 0),
        incoming: parseValue<number>(data.balance?.incoming, 0)
      },
      purchases_ids: parseValue<ID[]>(data.purchases_ids, [])
    }
    return fullAnswer
  } else {
    const partialAnswer: PartialUserType = {
      id: parseValue<ID>(data.id, crypto.randomUUID()),
      name: parseValue<string>(data.name, ''),
      role: parseValue<UserCategories['roles'][number]>(data.role, 'user'),
      profile_picture: parseValue<ImageType>(data.profile_picture, ''),
      books_ids: parseValue<ID[]>(data.books_ids, []),
      account_status: parseValue<UserCategories['accountStatus'][number]>(
        data.account_status,
        'Activo'
      ),
      created_at: parseValue<ISOString>(
        data.created_at,
        new Date().toISOString() as ISOString
      ),
      updated_at: parseValue<ISOString>(
        data.updated_at,
        new Date().toISOString() as ISOString
      ),
      bio: parseValue<string>(data.bio, ''),
      favorites: parseValue<ID[]>(data.favorites, []),
      conversations_ids: parseValue<ID[]>(data.conversations_ids, []),
      notifications_ids: parseValue<ID[]>(data.notifications_ids, []),
      validated: parseValue<boolean>(data.validated, false),
      login: parseValue<UserCategories['loginMethods'][number]>(
        data.login,
        'Default'
      ),
      location: parseValue<LocationType>(data.location, {
        street: '',
        city: '',
        country: '',
        postal_code: ''
      }),
      followers: parseValue<ID[]>(data.followers, []),
      following: parseValue<ID[]>(data.following, []),
      collections_ids: parseValue<CollectionItem[]>(data.collections_ids, []),
      preferences: parseValue<{
        [key: string]: number
      }>(data.preferences, {}),
      search_history: parseValue<{
        [key: string]: number
      }>(data.search_history, {}),
      balance: {
        pending: parseValue<number>(data.balance?.pending, 0),
        available: parseValue<number>(data.balance?.available, 0),
        incoming: parseValue<number>(data.balance?.incoming, 0)
      },
      purchases_ids: parseValue<ID[]>(data.purchases_ids, [])
    }
    return partialAnswer
  }
}

export { createUser }
