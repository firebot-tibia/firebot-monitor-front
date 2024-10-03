import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setTokens: (accessToken, refreshToken) => set({
    accessToken,
    refreshToken,
    isAuthenticated: true
  }),
  clearTokens: () => set({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  }),
  isTokenExpired: () => {
    const token = get().accessToken;
    if (!token) return true;
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp <= (Date.now() / 1000);
    } catch {
      return true;
    }
  }
}));