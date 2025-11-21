import { NotificationType } from '@/domain/entities/notification.js'
import { ID, ISOString } from '@/shared/types'
import { parseValue } from '@/utils/parseValue.js'

const createNotification = (
  data: Partial<NotificationType>
): NotificationType => {
  return {
    id: parseValue<ID>(data.id, crypto.randomUUID()),
    user_id: parseValue<ID>(data.user_id, crypto.randomUUID()),
    type: parseValue<string>(data.type, 'invalidNotification'),
    title: parseValue<string>(data.title, ''),
    body: parseValue<string>(data.body, ''),
    priority: parseValue<'low' | 'medium' | 'high'>(data.priority, 'low'),
    read: parseValue<boolean>(data.read, false),
    created_at: parseValue<ISOString>(
      data.created_at,
      new Date().toISOString() as ISOString
    ),
    action_url: parseValue<string | undefined>(data.action_url, undefined),
    expires_at: parseValue<ISOString>(
      data.expires_at,
      new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString() as ISOString
    ),
    metadata: parseValue<object>(data.metadata, {})
  }
}

export { createNotification }
