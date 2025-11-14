import dotenv from 'dotenv'
import { BookType } from '@/domain/entities/book'
import { NotificationType } from '@/domain/entities/notification'
import NotificationCategory from '@/domain/valueObjects/notificationCategories'
import { ID, ImageType, ISOString } from '@/shared/types'
import { PartialUserType } from '@/domain/entities/user'
dotenv.config()
// PROBLEMS I HAVE WITH THE TYPE OF NOTIFICATION
export type NotificationInfoNeeded = Partial<
  {
    id: ID
    id_vendedor: ID
    images: ImageType[]
    titulo: string
    created_in: ISOString
    expires_at: ISOString
    follower: PartialUserType
    order: string
    metadata: Partial<{
      book_id: ID
      book_title: string
      photo: ImageType
      guide: string
      question: string
      answer: string
    }>
  } & BookType
>
export function createNotification (
  data: NotificationInfoNeeded,
  template: NotificationCategory['notificationTypes'][number]
): NotificationType {
  const commonData = {
    id: data.id ?? crypto.randomUUID(),
    read: false,
    created_at: data.created_at ?? (new Date().toISOString() as ISOString),
    expires_at:
      data.expires_at ??
      (new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString() as ISOString)
  }
  let dataToSend: NotificationType
  switch (template) {
    case 'welcomeUser': {
      dataToSend = {
        ...commonData,
        title: '¡Bienvenido a Meridian!',
        priority: 'high',
        type: 'welcomeUser',
        user_id: data.id ?? crypto.randomUUID(),
        body: 'Estamos emocionados de tenerte con nosotros. Esperamos que disfrutes de la experiencia y encuentres justo lo que necesitas. Si tienes alguna pregunta, no dudes en contactarnos. ¡Gracias por unirte!',
        created_at: commonData.created_at
      }
      break
    }
    case 'newFollower': {
      dataToSend = {
        ...commonData,
        title: 'Tienes un nuevo seguidor',
        priority: 'low',
        type: 'newFollower',
        user_id: data.follower?.id ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/usuarios/${data.follower?.id}`,
        metadata: {
          photo: data.follower?.profile_picture ?? ''
        }
      }
      break
    }
    case 'bookPublished': {
      dataToSend = {
        ...commonData,
        title: 'Tu libro ha sido publicado con éxito',
        priority: 'high',
        type: 'bookPublished',
        user_id: data.id_vendedor ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          book_title: data.titulo,
          book_id: data.id
        }
      }
      break
    }
    case 'bookUpdated': {
      dataToSend = {
        ...commonData,
        title: 'Tu libro ha sido actualizado con éxito',
        priority: 'high',
        type: 'bookUpdated',
        user_id: data.id_vendedor ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          book_title: data.titulo,
          book_id: data.id
        }
      }
      break
    }
    case 'bookSold': {
      dataToSend = {
        ...commonData,
        title: 'Tu libro ha sido vendido con éxito',
        priority: 'high',
        type: 'bookSold',
        user_id: data.id_vendedor ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          book_title: data.titulo,
          book_id: data.id
        }
      }
      break
    }
    case 'bookBought': {
      dataToSend = {
        ...commonData,
        title: 'Has comprado un libro',
        priority: 'high',
        type: 'bookBought',
        user_id: data.id ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          guia: data.order,
          book_title: data.titulo,
          book_id: data.id
        }
      }
      break
    }
    case 'messageQuestion': {
      dataToSend = {
        ...commonData,
        title: `Tienes una nueva pregunta sobre tu libro "${data.titulo}"`,
        priority: 'high',
        type: 'messageQuestion',
        user_id: data.id_vendedor ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          book_title: data.titulo,
          book_id: data.id,
          question: data.metadata?.question
        }
      }
      break
    }
    case 'messageResponse': {
      dataToSend = {
        ...commonData,
        title: 'El vendedor ha respondido a tu pregunta',
        priority: 'high',
        type: 'messageResponse',
        user_id: data.id_vendedor ?? crypto.randomUUID(),
        action_url: `${process.env.FRONTEND_URL}/libros/${data.id}`,
        metadata: {
          photo: (data.images ?? [])[0],
          book_title: data.titulo,
          book_id: data.id,
          question: data.metadata?.question,
          answer: data.metadata?.answer
        }
      }
      break
    }
    default: {
      throw new Error(`Unknown notification template: ${template}`)
    }
  }
  return dataToSend as NotificationType
}
