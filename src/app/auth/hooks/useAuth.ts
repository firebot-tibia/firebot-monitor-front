import { useState, useEffect } from 'react';
import { useSession, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { useAuthStore } from '../../../store/auth-store';
import { AuthSchema, AuthDTO } from '../schema/auth.schema';
import { useTokenStore } from '../../../store/token-decoded-store';


export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const toast = useToast();
  const { status } = useSession();
  const router = useRouter();
  const { setTokens } = useAuthStore();

  const handleLogin = async () => {
    const result = AuthSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      return;
    }

    setErrors({});

    try {
      const data: AuthDTO = { email, password };
      
      const signInResult = await signIn('credentials', {
        email: data.email.trim(),
        password: data.password.trim(),
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      if (signInResult?.ok) {
        const session = await getSession();
        if (session?.access_token && session?.refresh_token) {
          setTokens(session.access_token, session.refresh_token);
          useTokenStore.getState().decodeAndSetToken(session.access_token);
        }
      
        toast({
          title: 'Logado com sucesso',
          description: 'Você será redirecionado para a página principal.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setErrors({ password: 'E-mail ou senha incorretos' });
      toast({
        title: 'Login incorreto',
        description: 'Verifique seu e-mail ou senha e tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    handleLogin,
  };
};