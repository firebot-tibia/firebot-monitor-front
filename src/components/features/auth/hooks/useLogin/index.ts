import { useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import type { ZodError } from 'zod'

import type { LoginError, ValidationError } from './types'
import { routes } from '../../../../../constants/routes'
import { AuthSchema } from '../../schema/auth.schema'

export const useLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginError>({})
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleValidationErrors = (error: ZodError) => {
    const fieldErrors: LoginError = {}
    error.errors.forEach((err: ValidationError) => {
      const field = err.path[0]
      if (field) {
        fieldErrors[field.toString()] = err.message
      }
    })
    return fieldErrors
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setErrors({})

      const validationResult = AuthSchema.safeParse({ email, password })
      if (!validationResult.success) {
        const fieldErrors = handleValidationErrors(validationResult.error)
        setErrors(fieldErrors)
        return
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (!result?.ok || result.error) {
        throw new Error(result?.error || 'Authentication failed')
      }

      const session = await getSession()

      if (!session?.access_token) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retrySession = await getSession()

        if (!retrySession?.access_token) {
          throw new Error('Failed to establish session')
        }
      }

      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      router.push(routes.guild)
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

  const clearFieldError = (field: keyof LoginError) => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }))
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    clearFieldError('email')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    clearFieldError('password')
  }

  return {
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    errors,
    isLoading,
    handleLogin,
  }
}
