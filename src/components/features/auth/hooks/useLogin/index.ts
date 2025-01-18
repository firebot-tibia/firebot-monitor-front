import { useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'

import { routes } from '../../../../../constants/routes'
import { AuthSchema } from '../../schema/auth.schema'
import { useAuth } from '../useAuth'

type LoginError = {
  email?: string
  password?: string
}

export const useLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginError>({})
  const toast = useToast()
  const router = useRouter()
  const { setTokens } = useAuth()

  const handleLogin = async () => {
    const validationResult = AuthSchema.safeParse({ email, password })

    if (!validationResult.success) {
      const fieldErrors: LoginError = {}
      validationResult.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof LoginError] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (!result?.ok) throw new Error(result?.error || 'Login Incorreto')

      const session = await getSession()
      if (!session?.access_token) throw new Error('No session token')

      setTokens(session.access_token, session.refresh_token!)
      router.push(routes.guild)

      toast({
        title: 'Logado com sucesso',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      setErrors({ password: 'Verifique as credênciais fornecidas' })
      toast({
        title: 'Login Incorreto',
        description: 'Verifique seu e-mail e senha e tente novamente.',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    handleLogin,
  }
}
