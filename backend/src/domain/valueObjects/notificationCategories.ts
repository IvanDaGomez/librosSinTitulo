export class NotificationCategory {
  static readonly priorities = ['low', 'normal', 'high'] as const
  static readonly notificationTypes = [
    'newMessage',
    'bookUpdated',
    'bookBought',
    'bookPublished',
    'bookRejected',
    'questionAnswered',
    'newQuestion',
    'bookSold',
    'orderShipped',
    'reviewReceived',
    'welcomeUser',
    'newFollower',
    'invalidNotification',
    'messageQuestion',
    'messageResponse'
  ] as const

  get priorities () {
    return NotificationCategory.priorities
  }

  get notificationTypes () {
    return NotificationCategory.notificationTypes
  }

  readonly id: string
  private _type: NotificationType
  private _priority: PriorityType
  readonly createdAt: Date
  private _updatedAt: Date

  constructor (params: {
    id?: string
    type: NotificationType
    priority?: PriorityType
    createdAt?: Date
    updatedAt?: Date
  }) {
    const { id, type, priority = 'normal', createdAt, updatedAt } = params

    if (!NotificationCategory.isValidType(type)) {
      throw new Error(`Invalid notification type: ${String(type)}`)
    }
    if (!NotificationCategory.isValidPriority(priority)) {
      throw new Error(`Invalid priority: ${String(priority)}`)
    }

    this.id =
      id ??
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    this._type = type
    this._priority = priority
    this.createdAt = createdAt ?? new Date()
    this._updatedAt = updatedAt ?? new Date()
  }

  get type (): NotificationType {
    return this._type
  }

  get priority (): PriorityType {
    return this._priority
  }

  get updatedAt (): Date {
    return new Date(this._updatedAt)
  }

  setPriority (newPriority: PriorityType) {
    if (!NotificationCategory.isValidPriority(newPriority)) {
      throw new Error(`Invalid priority: ${String(newPriority)}`)
    }
    this._priority = newPriority
    this.touch()
    return this
  }

  setType (newType: NotificationType) {
    if (!NotificationCategory.isValidType(newType)) {
      throw new Error(`Invalid notification type: ${String(newType)}`)
    }
    this._type = newType
    this.touch()
    return this
  }

  toJSON () {
    return {
      id: this.id,
      type: this._type,
      priority: this._priority,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString()
    }
  }

  static isValidPriority (value: unknown): value is PriorityType {
    return (
      typeof value === 'string' &&
      (NotificationCategory.priorities as readonly string[]).includes(value)
    )
  }

  static isValidType (value: unknown): value is NotificationType {
    return (
      typeof value === 'string' &&
      (NotificationCategory.notificationTypes as readonly string[]).includes(
        value
      )
    )
  }

  static from (obj: {
    id: string
    type: NotificationType
    priority?: PriorityType
    createdAt?: string | Date
    updatedAt?: string | Date
  }) {
    return new NotificationCategory({
      id: obj.id,
      type: obj.type,
      priority: obj.priority,
      createdAt: obj.createdAt ? new Date(obj.createdAt) : undefined,
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt) : undefined
    })
  }

  private touch () {
    this._updatedAt = new Date()
  }
}

export type PriorityType = typeof NotificationCategory.priorities[number]
export type NotificationType =
  typeof NotificationCategory.notificationTypes[number]

export {
  NotificationCategory as default,
  NotificationCategory as notificationCategories
}
