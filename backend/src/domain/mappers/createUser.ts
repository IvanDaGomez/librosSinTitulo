import { ISOString } from '@/shared/types'
import { PartialUserType, UserType } from '@/domain/entities/user'

function createUser(data: Partial<UserType>, fullInfo: false): PartialUserType
function createUser(data: Partial<UserType>, fullInfo: true): UserType

function createUser (
  data: Partial<UserType>,
  fullInfo = false
): UserType | PartialUserType {
  if (fullInfo) {
    const fullAnswer: UserType = {
      id: data.id ?? crypto.randomUUID(),
      name: data.name ?? '',
      email: data.email ?? '',
      password: data.password ?? '',
      role: data.role ?? 'user',
      profile_picture: data.profile_picture ?? '',
      books_ids: data.books_ids ?? [],
      account_status: data.account_status ?? 'Activo',
      created_at: data.created_at ?? (new Date().toISOString() as ISOString),
      updated_at: data.updated_at ?? (new Date().toISOString() as ISOString),
      bio: data.bio ?? '',
      favorites: data.favorites ?? [],
      conversations_ids: data.conversations_ids ?? [],
      notifications_ids: data.notifications_ids ?? [],
      validated: data.validated ?? false,
      login: data.login ?? 'Default',
      location: data.location ?? {
        street: '',
        city: '',
        country: '',
        postal_code: ''
      },
      followers: data.followers ?? [],
      following: data.following ?? [],
      collections_ids: data.collections_ids ?? [],
      preferences: data.preferences ?? {},
      search_history: data.search_history ?? {},
      balance: {
        pending: data.balance?.pending ?? 0,
        available: data.balance?.available ?? 0,
        incoming: data.balance?.incoming ?? 0
      },
      purchases_ids: data.purchases_ids ?? []
    }
    return fullAnswer
  } else {
    const partialAnswer: PartialUserType = {
      id: data.id ?? crypto.randomUUID(),
      name: data.name ?? '',
      role: data.role ?? 'user',
      profile_picture: data.profile_picture ?? '',
      books_ids: data.books_ids ?? [],
      account_status: data.account_status ?? 'Activo',
      created_at: data.created_at ?? (new Date().toISOString() as ISOString),
      updated_at: data.updated_at ?? (new Date().toISOString() as ISOString),
      bio: data.bio ?? '',
      favorites: data.favorites ?? [],
      conversations_ids: data.conversations_ids ?? [],
      notifications_ids: data.notifications_ids ?? [],
      validated: data.validated ?? false,
      login: data.login ?? 'Default',
      location: data.location ?? {
        street: '',
        city: '',
        country: '',
        postal_code: ''
      },
      followers: data.followers ?? [],
      following: data.following ?? [],
      collections_ids: data.collections_ids ?? [],
      preferences: data.preferences ?? {},
      search_history: data.search_history ?? {},
      balance: {
        pending: data.balance?.pending ?? 0,
        available: data.balance?.available ?? 0,
        incoming: data.balance?.incoming ?? 0
      },
      purchases_ids: data.purchases_ids ?? []
    }
    return partialAnswer
  }
}

export { createUser }
