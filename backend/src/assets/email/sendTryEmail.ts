import { sendEmail } from './sendEmail.js'

const accounts = ['info', 'support', 'billing', 'no-reply']
const randomAccount = accounts[Math.floor(Math.random() * accounts.length)] as
  | 'info'
  | 'support'
  | 'billing'
  | 'no-reply'

const sendTestEmail = async (
  randomAccount: 'info' | 'support' | 'billing' | 'no-reply'
) => {
  await sendEmail(
    'ivandavidgomezsilva@hotmail.com',
    'Test Email',
    '<h1>Test</h1>',
    randomAccount
  )
}
sendTestEmail(randomAccount)
console.log('Email sent successfully')
