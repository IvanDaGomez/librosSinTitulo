import { createEmail } from '../../assets/email/htmlEmails.js'
import { sendEmail } from '../../assets/email/sendEmail.js'
import { createNotification } from '../../assets/notifications/createNotification.js'
import { sendNotification } from '../../assets/notifications/sendNotification.js'
import { BookObjectType } from '../../domain/types/book.js'
import { IUsersModel } from '../../domain/types/models.js'
import { ISOString } from '../../domain/types/objects.js'
import { TransactionObjectType } from '../../domain/types/transaction.js'
import { PartialUserInfoType } from '../../domain/types/user.js'

export async function sendProcessPaymentEmails (data: {
  user: PartialUserInfoType
  seller: PartialUserInfoType
  book: BookObjectType
  transaction: TransactionObjectType
  shipping_details: any // TODO: Define the type for shippingDetails
  order: any // TODO: Define the type for order
  UsersModel: IUsersModel
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

    const userEmail = await UsersModel.getEmailById(user.id)
    const sellerEmail = await UsersModel.getEmailById(seller.id)
    if (transaction.response.payment_method_id === 'efecty' && userEmail) {
      console.log(
        'El pago es por Efecty, se enviará un correo de confirmación.'
      )
      await sendEmail(
        `${user.nombre} ${userEmail.correo}`,
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

    if (transaction?.status !== 'approved') {
      console.log(
        'El pago no fue aprobado, no se enviarán correos ni notificaciones.'
      )
      return
    }

    await Promise.all([
      sendEmail(
        `${user.nombre} ${userEmail.correo}`,
        '¡Gracias por tu compra!',
        createEmail(data, 'paymentDoneThank'),
        'billing'
      ),
      sendEmail(
        `${seller.nombre} ${sellerEmail.correo}`,
        '¡Tu libro ha sido vendido con éxito!',
        createEmail(data, 'bookSold'),
        'billing'
      ),
      sendEmail(
        `${user.nombre} ${userEmail.correo}`,
        'Comprobante de pago en Meridian',
        createEmail(data, 'paymentDoneBill'),
        'billing'
      ),
      sendEmail(
        `${seller.nombre} ${sellerEmail.correo}`,
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
            ...data,
            id_vendedor: seller.id,
            images: book.images,
            titulo: book.titulo,
            created_in: transaction.response.date_created as ISOString,
            expires_at: transaction.response.date_of_expiration as ISOString,
            follower: user,
            order: data.order
          },
          'bookBought'
        )
      ),
      sendNotification(
        createNotification(
          {
            ...data,
            id_vendedor: user.id,
            images: book.images,
            titulo: book.titulo,
            created_in: transaction.response.date_created as ISOString,
            expires_at: transaction.response.date_of_expiration as ISOString,
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
