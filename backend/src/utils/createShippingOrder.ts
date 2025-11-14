/* eslint-disable no-unused-vars */

import { ShippingDetailsType } from '@/domain/entities/shippingDetails'
import { executeQuery } from '@/utils/dbUtils'

// Create an order in Interrapidisimo
async function createInterrapidisimoOrder (orderData: {
  sender_name: string
  sender_address: string
  sender_city: string
  sender_phone: string
  recipient_name: string
  recipient_address: string
  recipient_city: string
  recipient_phone: string
  weight: number
  dimensions: number[]
  declared_value: number
  shipment_type?: string
}) {
  const url = 'https://api.interrapidisimo.com/ordenes' // Replace with real URL.
  const apiKey = 'YOUR_API_KEY' // Provided by Interrapidisimo.

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: orderData.sender_name,
        address: orderData.sender_address,
        city: orderData.sender_city,
        phone: orderData.sender_phone
      },
      recipient: {
        name: orderData.recipient_name,
        address: orderData.recipient_address,
        city: orderData.recipient_city,
        phone: orderData.recipient_phone
      },
      package: {
        weight: orderData.weight,
        dimensions: orderData.dimensions, // [length, width, height]
        declared_value: orderData.declared_value
      },
      shipment_type: orderData.shipment_type || 'standard'
    })
  })
  const data = await response.json()
  console.log('Order created:', data)
  return data
}

// Create an order using Envia
async function createEnviaOrder (orderData: ShippingDetailsType): Promise<any> {
  // NOTE: Implementation placeholder — remove the early return and implement the request
  return {}
  const url = 'https://api.envia.com/v1/create-order' // Replace with real URL.
  const apiToken = 'YOUR_API_TOKEN' // Provided by Envia.

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  if (response.ok) {
    orderData.status = 'pending'
  } else {
    orderData.status = 'cancelled'
    console.error('Error creating the order:', response.statusText)
    throw new Error(`Error creating the order: ${response.statusText}`)
  }
  const data = await response.json()
  console.log('Order created:', data)
  return data
}

// Create a manual order
async function createManualOrder (orderData: ShippingDetailsType): Promise<any> {
  // Implement logic to create a manual order.
  return orderData
}

export {
  createEnviaOrder as createEnviaOrder,
  createManualOrder as CreateShippingOrder
}
