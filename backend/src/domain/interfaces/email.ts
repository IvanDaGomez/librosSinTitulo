import { ID } from '@/shared/types'
import { StatusResponseType } from '@/domain/valueObjects/statusResponse.js'

export interface EmailInterface {
  getAllEmails(): Promise<string[]>
  getEmailById({ id }: { id: ID }): Promise<string>
  createEmail({ email }: { email: string }): Promise<{ email: string }>
  deleteEmail({ email }: { email: string }): Promise<StatusResponseType>
}
