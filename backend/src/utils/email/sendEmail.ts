/* eslint-disable no-unused-vars */
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { google } from 'googleapis'
import { __dirname } from '@/utils/config.js'
dotenv.config()

/**
 * Email add passwords for
 * - info@meridianlib.com
 * - support@meridianlib.com
 * - billing@meridianlib.com
 */
const infoEmail = process.env.INFO_EMAIL || ''
const infoPassword = process.env.INFO_PASSWORD || ''
const supportEmail = process.env.SUPPORT_EMAIL || ''
const supportPassword = process.env.SUPPORT_PASSWORD || ''
const billingEmail = process.env.BILLING_EMAIL || ''
const billingPassword = process.env.BILLING_PASSWORD || ''
const noReplyEmail = process.env.NO_REPLY_EMAIL || ''
const noReplyPassword = process.env.NO_REPLY_PASSWORD || ''
// Host for Email
const host = process.env.EMAIL_HOST || ''
/**
 * Send mail
 * @param {string} to
 * @param {string} subject
 * @param {string[html]} htmlContent
 * @returns
 */
const oAuth2Client = new google.auth.OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // OAuth2 redirect URL
)
oAuth2Client.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN })

const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  from: 'info' | 'support' | 'billing' | 'no-reply' = 'info'
): Promise<any> => {
  try {
    // Get access token from OAuth2 client
    // const accessToken = await oAuth2Client.getAccessToken()

    // Set up the transporter using OAuth2
    let email = ''
    let emailPassword = ''
    switch (from) {
      case 'info':
        email = infoEmail
        emailPassword = infoPassword
        break
      case 'support':
        email = supportEmail
        emailPassword = supportPassword
        break
      case 'billing':
        email = billingEmail
        emailPassword = billingPassword
        break
      case 'no-reply':
        email = noReplyEmail
        emailPassword = noReplyPassword
        break
    }
    const transporterOptions = {
      host,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: email, // Your email address
        pass: emailPassword
      }
    }
    const transporter = nodemailer.createTransport(transporterOptions)

    // Set up email options
    const mailOptions = {
      from: `${process.env.BRAND_NAME} <${email}>`, // Your email address
      to, // Recipient
      subject, // Subject of the email
      html: htmlContent, // HTML content of the email
      attachments: [
        {
          filename: 'logo.png',
          path: `${__dirname}/data/images/logo.png`, // Ensure the correct file path
          cid: 'logo@meridian' // CID for inline images
        }
      ]
    }
    // Send email
    const res = await transporter.sendMail(mailOptions) // Send the email asynchronously
    return res // Return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export { sendEmail }
