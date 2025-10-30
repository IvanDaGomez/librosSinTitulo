export interface EmailInterface {
  getAllEmails(): Promise<string[]>
  getEmailById(id: ID): Promise<string>
  createEmail(data: { email: string }): Promise<{ email: string }>
  deleteEmail(emailGiven: string): Promise<{ message: string }>
}
