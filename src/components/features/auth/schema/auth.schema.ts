import { z } from 'zod'

export const AuthSchema = z.object({
  email: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type AuthDTO = z.infer<typeof AuthSchema>
