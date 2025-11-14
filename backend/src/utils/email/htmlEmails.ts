import dotenv from 'dotenv'

import {
  thankEmailTemplate,
  bookPublishedTemplate,
  validationEmailTemplate,
  changePasswordTemplate,
  paymentDoneBillTemplate,
  paymentDoneThankTemplate,
  bookSoldTemplate,
  efectyPendingPaymentTemplate,
  DataType,
  messageResponseTemplate,
  messageQuestionTemplate
} from '@/utils/email/htmlTemplates'
dotenv.config()

type emailToSendType =
  | 'thankEmail'
  | 'bookPublished'
  | 'newQuestion'
  | 'validationEmail'
  | 'changePassword'
  | 'paymentDoneBill'
  | 'paymentDoneThank'
  | 'bookSold'
  | 'efectyPendingPayment'
  | 'messageQuestion'
  | 'messageResponse'

function createEmail (data: DataType, template: emailToSendType): string {
  switch (template) {
    case 'thankEmail': {
      return thankEmailTemplate(data)
    }
    case 'bookPublished': {
      return bookPublishedTemplate(data)
    }
    case 'validationEmail': {
      return validationEmailTemplate(data)
    }
    case 'changePassword': {
      return changePasswordTemplate(data)
    }
    case 'paymentDoneBill': {
      return paymentDoneBillTemplate(data)
    }
    case 'paymentDoneThank': {
      return paymentDoneThankTemplate(data)
    }
    case 'bookSold': {
      return bookSoldTemplate(data)
    }
    case 'efectyPendingPayment': {
      return efectyPendingPaymentTemplate(data)
    }
    case 'messageQuestion': {
      return messageQuestionTemplate(data)
    }
    case 'messageResponse': {
      return messageResponseTemplate(data)
    }
    default: {
      return ''
    }
  }
}

export { createEmail }
