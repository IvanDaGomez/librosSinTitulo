import { createEmail } from '@/utils/email/htmlEmails.js'
import { sendEmail } from '@/utils/email/sendEmail.js'
import { createNotification } from '@/utils/notifications/createNotification.js'
import { sendNotification } from '@/utils/notifications/sendNotification.js'
import { BookType } from '@/domain/entities/book.js'
import { ISOString } from '@/shared/types'
import { TransactionType } from '@/domain/entities/transaction.js'
import { PartialUserType } from '@/domain/entities/user.js'
import { UserInterface } from '@/domain/interfaces/user.js'

export async function sendProcessPaymentEmails (data: {
  user: PartialUserType
  seller: PartialUserType
  book: BookType
  transaction: TransactionType
  shipping_details: any // TODO: Define the type for shippingDetails
  order: any // TODO: Define the type for order
  UsersModel: UserInterface
}) {
  try {
    const {
      user,
      seller,
      book,
      transaction,
      shipping_details,
      order,
      UsersModel
    } = data

    const userEmail = await UsersModel.getEmailById({ id: user.id })
    const sellerEmail = await UsersModel.getEmailById({ id: seller.id })
    if (transaction.method === 'efecty' && userEmail) {
      console.log(
        'El pago es por Efecty, se enviará un correo de confirmación.'
      )
      await sendEmail(
        `${user.name} ${userEmail.email}`,
        'Información de tu pago en Efecty',
        createEmail(
          {
            ...data,
            user: data.user,
            shipping_details: data.shipping_details
            // order: data.order
          },
          'efectyPendingPayment'
        ),
        'billing'
      )
    }

    if (transaction?.status !== 'completed') {
      console.log(
        'El pago no fue aprobado, no se enviarán correos ni notificaciones.'
      )
      return
    }

    await Promise.all([
      sendEmail(
        `${user.name} ${userEmail.email}`,
        '¡Gracias por tu compra!',
        createEmail(data, 'paymentDoneThank'),
        'billing'
      ),
      sendEmail(
        `${seller.name} ${sellerEmail.email}`,
        '¡Tu libro ha sido vendido con éxito!',
        createEmail(data, 'bookSold'),
        'billing'
      ),
      sendEmail(
        `${user.name} ${userEmail.email}`,
        'Comprobante de pago en Meridian',
        createEmail(data, 'paymentDoneBill'),
        'billing'
      ),
      sendEmail(
        `${seller.name} ${sellerEmail.email}`,
        'Comprobante de pago en Meridian',
        createEmail(
          {
            ...data,
            user: seller
          },
          'paymentDoneBill'
        ),
        'billing'
      ),
      sendNotification(
        createNotification(
          {
            id: book.id,
            id_vendedor: seller.id,
            images: book.images,
            titulo: book.title,
            created_in:
              ((transaction as any)?.response?.date_created as ISOString) ??
              ((transaction as any)?.date_created as ISOString) ??
              (new Date().toISOString() as ISOString),
            expires_at:
              ((transaction as any)?.response
                ?.date_of_expiration as ISOString) ??
              ((transaction as any)?.date_of_expiration as ISOString) ??
              (new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ).toISOString() as ISOString),
            follower: user,
            order: data.order
          },
          'bookBought'
        )
      ),
      sendNotification(
        createNotification(
          {
            id: book.id,
            id_vendedor: user.id,
            images: book.images,
            titulo: book.title,
            created_in:
              ((transaction as any)?.response?.date_created as ISOString) ??
              ((transaction as any)?.date_created as ISOString) ??
              (new Date().toISOString() as ISOString),
            expires_at:
              ((transaction as any)?.response
                ?.date_of_expiration as ISOString) ??
              ((transaction as any)?.date_of_expiration as ISOString) ??
              (new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ).toISOString() as ISOString),
            follower: seller,
            order: data.order
          },
          'bookSold'
        )
      )
    ])
  } catch (error) {
    console.error('Error al enviar correos o notificaciones:', error)
  }
}
