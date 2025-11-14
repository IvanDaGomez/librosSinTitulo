import { NotificationType } from '@/domain/entities/notification'
import { ISOString } from '@/shared/types'

const createNotification = (
  data: Partial<NotificationType>
): NotificationType => {
  return {
    id: data.id ?? crypto.randomUUID(),
    user_id: data.user_id ?? crypto.randomUUID(),
    type: data.type ?? 'invalidNotification',
    title: data.title ?? '',
    body: data.body ?? '',
    priority: data.priority ?? 'low',
    read: data.read ?? false,
    created_at: data.created_at ?? (new Date().toISOString() as ISOString),
    action_url: data.action_url,
    expires_at:
      data.expires_at ??
      (new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString() as ISOString),
    metadata: data.metadata ?? {}
  }
}

export { createNotification }
