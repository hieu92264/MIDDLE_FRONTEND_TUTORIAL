import { useMutation } from '@tanstack/vue-query'
import { AuthService } from '@/services/auth.service'
import type { LoginSchema } from '@/modules/auth/schemas'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (values: LoginSchema) => AuthService.login(values),
  })
}
