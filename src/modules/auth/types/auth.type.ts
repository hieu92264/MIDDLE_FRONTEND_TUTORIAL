import type { BaseInterface } from '@/types/base-interface.type'

export interface AuthUserInterface extends BaseInterface {
  username: string
  email: string
  password?: string
  role: string
}

export type AuthPayload = {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUserInterface
}
