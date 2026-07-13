import type { LoginSchema, RegisterSchema } from '@/modules/auth/schemas'
import type { AuthPayload, AuthUserInterface } from '@/modules/auth/types/auth.type'
import { httpService } from '@/services/http.service'

export const AUTH_URL = {
  LOGIN: '/auth/login',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
}

export class AuthService {
  static async login(data: LoginSchema) {
    const metadata = await httpService.post<AuthPayload>(AUTH_URL.LOGIN, data)
    return metadata
  }

  static async me() {
    const metadata = await httpService.get<AuthUserInterface>(AUTH_URL.ME)
    return metadata
  }

  static async refreshToken() {
    const metadata = await httpService.post<AuthPayload>(AUTH_URL.REFRESH)
    return metadata
  }

  static async register(data: RegisterSchema) {
    const metadata = await httpService.post<
      Omit<AuthUserInterface, 'user_name_created' | 'user_name_updated'>
    >(AUTH_URL.REGISTER, data)
    return metadata
  }

  static async logout() {
    await httpService.post(AUTH_URL.LOGOUT)
  }
}
