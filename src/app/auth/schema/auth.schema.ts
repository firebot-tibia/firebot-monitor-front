import { z } from 'zod';

export const AuthSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type AuthDTO = z.infer<typeof AuthSchema>;
