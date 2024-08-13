import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AuthDTO } from '../../shared/dtos/auth.dto';
import { isTokenValid, setTokenWithExpiry } from '../../shared/utils/auth-utils';
import { login as loginService } from '../../services/auth';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (data: AuthDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && isTokenValid(token)) {
      console.log('token is valid');
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (data: AuthDTO) => {
    const response = await loginService(data);
    console.log('response', response);
    setTokenWithExpiry(response.access_token);
    setIsAuthenticated(true);
    router.push('/home');
  };

  const logout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
