import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse'

export interface EmailInterface {
  getAllEmails(): Promise<string[]>
  getEmailById(id: ID): Promise<string>
  createEmail(data: { email: string }): Promise<{ email: string }>
  deleteEmail(emailGiven: string): Promise<StatusResponseType>
}
