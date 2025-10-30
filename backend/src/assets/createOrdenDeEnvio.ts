/* eslint-disable no-unused-vars */

import { ShippingDetailsType } from '../domain/types/shippingDetails'
import { executeQuery } from '../utils/dbUtils'

async function crear_orden_interrapidisimo (orden_data: {
  remitente_nombre: string
  remitente_direccion: string
  remitente_ciudad: string
  remitente_telefono: string
  destinatario_nombre: string
  destinatario_direccion: string
  destinatario_ciudad: string
  destinatario_telefono: string
  peso: number
  dimensiones: number[]
  valor_declarado: number
  tipo_envio?: string
}) {
  const url = 'https://api.interrapidisimo.com/ordenes' // Reemplazar por URL real.
  const api_key = 'TU_API_KEY' // Proporcionada por Interrapidísimo.

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      remitente: {
        nombre: orden_data.remitente_nombre,
        direccion: orden_data.remitente_direccion,
        ciudad: orden_data.remitente_ciudad,
        telefono: orden_data.remitente_telefono
      },
      destinatario: {
        nombre: orden_data.destinatario_nombre,
        direccion: orden_data.destinatario_direccion,
        ciudad: orden_data.destinatario_ciudad,
        telefono: orden_data.destinatario_telefono
      },
      paquete: {
        peso: orden_data.peso,
        dimensiones: orden_data.dimensiones, // [largo, ancho, alto]
        valor_declarado: orden_data.valor_declarado
      },
      tipo_envio: orden_data.tipo_envio || 'estandar'
    })
  })
  const data = await response.json()
  console.log('Orden creada:', data)
  return data
}

async function create_orden_de_envio_envia (
  orden_data: ShippingDetailsType
): Promise<any> {
  return {}
  const url = 'https://api.envia.com/v1/create-order' // Reemplazar por URL real.
  const api_token = 'TU_API_TOKEN' // Proporcionado por Envia.

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${api_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  if (response.ok) {
    orden_data.status = 'pending'
  } else {
    orden_data.status = 'not_delivered'
    console.error('Error al crear la orden:', response.statusText)
    throw new Error(`Error al crear la orden: ${response.statusText}`)
  }
  const data = await response.json()
  console.log('Orden creada:', data)
  return data
}

async function create_manual_order (
  orden_data: ShippingDetailsType
): Promise<any> {
  // Implementar lógica para crear una orden manual.
  return orden_data
}
export {
  create_orden_de_envio_envia,
  create_manual_order as CreateOrdenDeEnvío
}
