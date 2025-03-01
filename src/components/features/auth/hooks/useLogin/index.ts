import { useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import type { ZodError } from 'zod'

import type { LoginError, ValidationError } from './types'
import { routes } from '../../../../../common/constants/routes'
import { AuthSchema } from '../../schema/auth.schema'

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

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

  const waitForSession = async (attempts = MAX_RETRY_ATTEMPTS): Promise<boolean> => {
    if (attempts <= 0) return false

    const session = await getSession()
    if (session?.access_token) return true

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    return waitForSession(attempts - 1)
  }

  const handleLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setErrors({})

      const validationResult = AuthSchema.safeParse({ email, password })
      if (!validationResult.success) {
        const fieldErrors = handleValidationErrors(validationResult.error)
        setErrors(fieldErrors)
        setIsLoading(false)
        return false
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (!result?.ok || result.error) {
        throw new Error(result?.error || 'Authentication failed')
      }

      const sessionEstablished = await waitForSession()
      if (!sessionEstablished) {
        throw new Error('Failed to establish session')
      }

      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Ensure navigation is complete before proceeding
      await router.push(routes.guild)
      await router.refresh()
      return true
    } catch (error) {
      setErrors({ password: 'Verifique as credênciais fornecidas' })
      toast({
        title: 'Login Incorreto',
        description: 'Verifique seu e-mail e senha e tente novamente.',
        status: 'error',
        duration: 3000,
      })
      return false
    } finally {
      setIsLoading(false)
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
