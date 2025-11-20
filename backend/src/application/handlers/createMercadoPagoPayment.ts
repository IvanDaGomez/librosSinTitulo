import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types'
import type { Options } from 'mercadopago/dist/types.d.ts'

import { Shipments } from 'mercadopago/dist/clients/commonTypes'
import { BookType } from '@/domain/entities/book'
import { UserType } from '@/domain/entities/user'
import { MercadoPagoInput } from '@/domain/entities/mercadoPago'
export function createMercadoPagoPayment ({
  form_data,
  partial_data,
  payment_method,
  book,
  user
}: MercadoPagoInput & { book: BookType; user: UserType }): {
  body: PaymentCreateRequest
  requestOptions: Options
} {
  const XidempotencyKey = crypto.randomUUID()
  return {
    body: {
      transaction_amount: form_data.transaction_amount, // Monto total de la transacción
      payment_method_id: form_data.payment_method_id,
      payer: {
        email: form_data.payer.email,
        identification: {
          type: form_data.payer?.identification?.type ?? '',
          number: form_data.payer?.identification?.number ?? ''
        }
      },
      description: partial_data.description,
      installments: form_data?.installments || 1,
      token: form_data.token || '',
      issuer_id: parseInt(form_data?.issuer_id ?? '0', 10) || 0,
      additional_info: {
        items: [
          {
            id: book.id,
            title: book.title,
            description: book.description,
            picture_url: book.images[0],
            category_id: book.genre,
            quantity: 1,
            unit_price: book?.offer || book?.price
          }
        ],
        ip_address: partial_data.shipping_details.user_id,
        shipments: {
          receiver_address: {
            zip_code: partial_data.shipping_details.address.postal_code,
            street_name: partial_data.shipping_details.address.street,
            street_number: parseInt(
              partial_data.shipping_details.address.street.match(/\d+/)?.[0] ||
                '0',
              10
            ),
            // apartment: partialData.shippingDetails.apartment,
            city_name: partial_data.shipping_details.address.city,
            state_name: partial_data.shipping_details.address.department
          }
        }
      },
      callback_url: partial_data.callback_url || '', // URL de retorno después del pago
      application_fee: partial_data.application_fee ?? 0, // Tarifa de la aplicación
      /* marketplace: {
        collector_id: process.env.MERCADOPAGO_COLLECTOR_ID // ID de tu cuenta colectora principal
      }, */
      external_reference: `book_${partial_data.book_id}_${partial_data.user_id}`, // Referencia para identificar el pago
      notification_url: `${process.env.BACKEND_DOMAIN}/api/users/mercadoPagoWebHooks?source_news=webhooks` // Webhook para notificaciones
      /* payments: [
        {
          collector_id: sellerId, // ID de la página de gestiones
          amount: transaction_amount - application_fee, // Lo que queda para el vendedor
          payment_method_id: data.payment_method_id
        },
        {
          collector_id: marketplaceCollectorId, // ID del marketplace (comisiones)
          amount: application_fee, // Comisión del marketplace
          payment_method_id: data.payment_method_id
        }
      ] */
    },
    requestOptions: { idempotencyKey: XidempotencyKey }
  }
}
