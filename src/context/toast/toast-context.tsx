import { createContext, useContext, ReactNode } from 'react';
import { useToast, UseToastOptions } from '@chakra-ui/react';

interface ToastContextProps {
  showToast: (options: UseToastOptions) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();

  const showToast = (options: UseToastOptions) => {
    toast(options);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
