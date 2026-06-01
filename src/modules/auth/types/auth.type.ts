import type { BaseInterface } from '@/types/base-interface.type'

export interface UserInterface extends BaseInterface {
  username: string
  email: string
  password?: string
  role: string
}

export type AuthPayload = {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInterface
}
